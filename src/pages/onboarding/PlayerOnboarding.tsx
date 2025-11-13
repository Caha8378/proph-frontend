import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle2, Upload } from 'lucide-react';
import { StatsIntegrityPledge } from '../../components/onboarding/StatsIntegrityPledge';
import { StatsWarningBox } from '../../components/onboarding/StatsWarningBox';
import { ConsolidatedHighStatWarning } from '../../components/onboarding/ConsolidatedHighStatWarning';
// import { VerificationSourceModal } from '../../components/onboarding/VerificationSourceModal'; // Kept for future use
import { PlayerCardFinal1 } from '../../components/player/PlayerCardFinal1';
import type { PlayerProfile } from '../../types';
import { useAuth } from '../../context/authContext';
import apiClient from '../../api/client';
import { getPlayerProfile } from '../../api/players';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

type Step = 'pledge' | 'step1' | 'step2' | 'step3' | 'step4' | 'verification' | 'processing' | 'reveal';

interface PlayerProfileData {
  // Step 0
  statsIntegrityCertified: boolean;
  
  // Step 1 - Basics
  name: string;
  heightFeet: string;
  heightInches: string;
  weight: string;
  dateOfBirth: string; // YYYY-MM-DD format
  gender: string; // Male or Female
  
  // Step 2 - School
  highSchool: string;
  city: string;
  state: string;
  classYear: number;
  clop: string; // Current Level of Play
  division: string; // Division (for College or Varsity)
  
  // Step 3 - Stats
  gamesPlayed: string;
  ppg: string;
  rpg: string;
  apg: string;
  fgm: string; // Field goals made
  fga: string; // Field goals attempted
  threepm: string; // 3-pointers made
  threepa: string; // 3-pointers attempted
  ftm: string; // Free throws made
  fta: string; // Free throws attempted
  steals: string;
  blocks: string;
  
  // Step 4 - Photo & Academic
  photo: string;
  highlightUrl: string;
  gpa: string;
  sat: string;
  act: string;
  
  // Verification
  verificationUrl?: string;
  verificationSource?: 'maxpreps' | 'hudl' | 'school' | 'later';
  highStatConfirmations: { [statName: string]: boolean };
}

// Stat thresholds (using default since position is determined by algorithm)
const getStatThresholds = () => {
  return { ppg: 25, apg: 10, rpg: 12 };
};

export const PlayerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('pledge');
  const [profileData, setProfileData] = useState<PlayerProfileData>({
    statsIntegrityCertified: false,
    name: '',
    heightFeet: '',
    heightInches: '',
    weight: '',
    dateOfBirth: '',
    gender: '',
    highSchool: '',
    city: '',
    state: '',
    classYear: new Date().getFullYear() + 1,
    clop: '',
    division: '',
    gamesPlayed: '',
    ppg: '',
    rpg: '',
    apg: '',
    fgm: '',
    fga: '',
    threepm: '',
    threepa: '',
    ftm: '',
    fta: '',
    steals: '',
    blocks: '',
    photo: '',
    highlightUrl: '',
    gpa: '',
    sat: '',
    act: '',
    highStatConfirmations: {},
  });

  const [createdProfile, setCreatedProfile] = useState<PlayerProfile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stat threshold checks
  const statWarnings = useMemo(() => {
    const thresholds = getStatThresholds();
    const warnings: { [key: string]: { threshold: number; confirmed: boolean } } = {};

    // Core stats
    if (profileData.ppg && parseFloat(profileData.ppg) > thresholds.ppg) {
      warnings.ppg = {
        threshold: thresholds.ppg,
        confirmed: profileData.highStatConfirmations.ppg || false,
      };
    }
    if (profileData.apg && parseFloat(profileData.apg) > thresholds.apg) {
      warnings.apg = {
        threshold: thresholds.apg,
        confirmed: profileData.highStatConfirmations.apg || false,
      };
    }
    if (profileData.rpg && parseFloat(profileData.rpg) > thresholds.rpg) {
      warnings.rpg = {
        threshold: thresholds.rpg,
        confirmed: profileData.highStatConfirmations.rpg || false,
      };
    }

    // Defense stats
    if (profileData.steals && parseFloat(profileData.steals) > 4) {
      warnings.steals = {
        threshold: 4,
        confirmed: profileData.highStatConfirmations.steals || false,
      };
    }
    if (profileData.blocks && parseFloat(profileData.blocks) > 4) {
      warnings.blocks = {
        threshold: 4,
        confirmed: profileData.highStatConfirmations.blocks || false,
      };
    }

    return warnings;
  }, [profileData]);

  // Consolidated confirmation state for all high stats
  const [allHighStatsConfirmed, setAllHighStatsConfirmed] = useState(false);

  // Reset confirmation when high stats change
  useEffect(() => {
    setAllHighStatsConfirmed(false);
  }, [Object.keys(statWarnings).join(',')]);

  const canContinueStep2 = () => {
    const requiredFields = [
      profileData.highSchool,
      profileData.city,
      profileData.state,
      profileData.gamesPlayed,
      profileData.ppg,
      profileData.rpg,
      profileData.apg,
      profileData.fgm,
      profileData.fga,
      profileData.threepm,
      profileData.threepa,
      profileData.ftm,
      profileData.fta,
      profileData.steals,
      profileData.blocks,
    ];
    
    const allFieldsFilled = requiredFields.every(field => field.trim() !== '');
    
    // If there are high stats, they must all be confirmed
    const hasHighStats = Object.keys(statWarnings).length > 0;
    const warningsConfirmed = !hasHighStats || allHighStatsConfirmed;
    
    return allFieldsFilled && warningsConfirmed;
  };

  // Handle consolidated confirmation - mark all high stats as confirmed
  const handleAllStatsConfirm = (confirmed: boolean) => {
    setAllHighStatsConfirmed(confirmed);
    if (confirmed) {
      // Mark all high stats as confirmed
      const confirmations: { [key: string]: boolean } = {};
      Object.keys(statWarnings).forEach(statKey => {
        confirmations[statKey] = true;
      });
      setProfileData(prev => ({
        ...prev,
        highStatConfirmations: {
          ...prev.highStatConfirmations,
          ...confirmations,
        },
      }));
    } else {
      // Clear all confirmations
      const confirmations: { [key: string]: boolean } = {};
      Object.keys(statWarnings).forEach(statKey => {
        confirmations[statKey] = false;
      });
      setProfileData(prev => ({
        ...prev,
        highStatConfirmations: {
          ...prev.highStatConfirmations,
          ...confirmations,
        },
      }));
    }
  };

  const handleCreateProfile = async () => {
    try {
      // Get pending signup data
      const pendingEmail = localStorage.getItem('pendingEmail');
      const pendingPassword = localStorage.getItem('pendingPassword');
      
      if (!pendingEmail || !pendingPassword) {
        alert('Session expired. Please sign up again.');
        navigate('/signup');
        return;
      }
      
      // Format height (convert feet/inches to total inches)
    const height = profileData.heightFeet && profileData.heightInches
        ? parseInt(profileData.heightFeet) * 12 + parseInt(profileData.heightInches)
        : 0;
      
      // Calculate age from date of birth
      let age = null;
      if (profileData.dateOfBirth) {
        const birthDate = new Date(profileData.dateOfBirth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      
      setCurrentStep('processing');
      
      // Get user ID if available (user may have signed up and have token stored)
      const storedUser = localStorage.getItem('user');
      let userId = null;
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userId = user.id || null;
        } catch (error) {
          console.error('Failed to parse user from localStorage:', error);
        }
      }
      
      // Build request body according to backend's standardized JSON format
      const requestBody = {
        userId: userId, // null for unclaimed profiles, or user ID if available
        email: pendingEmail,
      name: profileData.name,
        height: height, // Total inches
        weight: profileData.weight ? parseInt(profileData.weight) : null,
        age: age, // Calculated from date of birth
        gender: profileData.gender || null, // Male or Female
        clop: profileData.clop || null, // Current Level of Play
        division: profileData.division || null, // Division (for College or Varsity)
      school: profileData.highSchool,
        graduation_year: profileData.classYear,
        city: profileData.city,
        state: profileData.state,
        gpa: profileData.gpa ? parseFloat(profileData.gpa) : null,
        sat: profileData.sat ? parseInt(profileData.sat) : null,
        act: profileData.act ? parseInt(profileData.act) : null,
        highlight_video_link: profileData.highlightUrl || null,
        // Stats as nested object with standardized field names
      stats: {
          gp: parseInt(profileData.gamesPlayed) || 0, // Changed from games_played to gp
        ppg: parseFloat(profileData.ppg) || 0,
        rpg: parseFloat(profileData.rpg) || 0,
        apg: parseFloat(profileData.apg) || 0,
          spg: parseFloat(profileData.steals) || 0,
          bpg: parseFloat(profileData.blocks) || 0,
          topg: 0, // Turnovers per game (default to 0, not collected in form)
          threepm: parseInt(profileData.threepm) || 0,
          threepa: parseInt(profileData.threepa) || 0,
          fgm: parseInt(profileData.fgm) || 0,
          fga: parseInt(profileData.fga) || 0,
          ftm: parseInt(profileData.ftm) || 0,
          fta: parseInt(profileData.fta) || 0,
        },
        // Image as base64 data URL (already converted in handleFileUpload)
        profile_image_url: profileData.photo || null,
      };
      
      // Call backend API to create player profile
      // Endpoint: /auth/register/player (backend accepts with or without token)
      // Using authenticated client - it automatically attaches token if available via interceptor
      const response = await apiClient.post('/auth/register/player', requestBody);
      
      const registerData = response.data;
      console.log('Profile created:', registerData);
      
      // Auto-login after profile creation
      await login(pendingEmail, pendingPassword);
      
      // Clear pending data (security: remove password from localStorage)
      localStorage.removeItem('pendingEmail');
      localStorage.removeItem('pendingPassword');
      localStorage.removeItem('pendingRole');
      
      // Wait a moment for auth token to be set, then fetch the full profile
      // The backend returns algorithm data in the response, but we need the full profile for the card
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch the full profile data from the backend
      const fullProfile = await getPlayerProfile();
      console.log('Full profile fetched:', fullProfile);
      
      // Convert backend profile to frontend PlayerProfile format
      const profileForCard: PlayerProfile = {
        id: fullProfile.id?.toString() || `player-${Date.now()}`,
        name: fullProfile.name || profileData.name,
        position: fullProfile.clop || fullProfile.playstyle || 'TBD',
        photo: fullProfile.profile_image_url || profileData.photo || '/IMG_1918.jpeg',
        school: fullProfile.school || profileData.highSchool,
        height: fullProfile.height 
          ? `${Math.floor(fullProfile.height / 12)}'${fullProfile.height % 12}"`
          : `${profileData.heightFeet}'${profileData.heightInches}"`,
        weight: fullProfile.weight || (profileData.weight ? parseInt(profileData.weight) : undefined),
        age: fullProfile.age || age || undefined,
        location: fullProfile.city && fullProfile.state 
          ? `${fullProfile.city}, ${fullProfile.state}`
          : `${profileData.city}, ${profileData.state}`,
        classYear: fullProfile.graduation_year || profileData.classYear,
        evaluation: {
          level: fullProfile.projected_level || 'TBD',
          comparisons: [
            fullProfile.comp_player_1,
            fullProfile.comp_player_2,
            fullProfile.comp_player_3,
          ].filter(Boolean) as string[], // Filter out undefined/null values
        },
        stats: {
          ppg: fullProfile.stats?.ppg || parseFloat(profileData.ppg) || 0,
          rpg: fullProfile.stats?.rpg || parseFloat(profileData.rpg) || 0,
          apg: fullProfile.stats?.apg || parseFloat(profileData.apg) || 0,
          // Calculate percentages from makes/attempts for display
          fgPercentage: fullProfile.stats?.fg_percentage 
            ? fullProfile.stats.fg_percentage * 100
            : (profileData.fga && parseFloat(profileData.fga) > 0 
              ? (parseFloat(profileData.fgm) / parseFloat(profileData.fga)) * 100 
              : 0),
          threePtPercentage: fullProfile.stats?.three_pt_percentage
            ? fullProfile.stats.three_pt_percentage * 100
            : (profileData.threepa && parseFloat(profileData.threepa) > 0
              ? (parseFloat(profileData.threepm) / parseFloat(profileData.threepa)) * 100
              : 0),
          steals: fullProfile.stats?.steals || parseFloat(profileData.steals) || 0,
          blocks: fullProfile.stats?.blocks || parseFloat(profileData.blocks) || 0,
        },
        // Include academic info if available (for card display)
        gpa: fullProfile.gpa || (profileData.gpa ? parseFloat(profileData.gpa) : undefined),
        sat: fullProfile.sat || (profileData.sat ? parseInt(profileData.sat) : undefined),
        act: fullProfile.act || (profileData.act ? parseInt(profileData.act) : undefined),
        highlightVideoLink: fullProfile.highlight_video_link || fullProfile.highlightVideoLink || profileData.highlightUrl || undefined,
        // Include contact info if available (for card display)
        email: fullProfile.email || pendingEmail || undefined,
        phoneNumber: fullProfile.phone_number || fullProfile.phoneNumber || undefined,
      statsIntegrityCertified: profileData.statsIntegrityCertified,
      highStatConfirmations: profileData.highStatConfirmations,
        verificationUrl: undefined,
        verificationStatus: 'pending_auto_check',
        verified: false,
      };

      setCreatedProfile(profileForCard);

      // Show processing animation, then reveal
    setTimeout(() => {
      setCurrentStep('reveal');
    }, 3000);
      
    } catch (error: any) {
      console.error('Error creating profile:', error);
      setCurrentStep('step4'); // Go back to last step
      alert(error.response?.data?.message || error.message || 'Failed to create profile. Please try again.');
    }
  };

  // Render based on current step
  if (currentStep === 'pledge') {
    return (
      <StatsIntegrityPledge
        onContinue={() => {
          setProfileData(prev => ({ ...prev, statsIntegrityCertified: true }));
          setCurrentStep('step1');
        }}
      />
    );
  }

  // Verification step removed - stats integrity pledge and high stat warnings are sufficient
  // VerificationSourceModal kept in codebase for future use if needed

  if (currentStep === 'processing') {
    return (
      <div className="min-h-screen bg-proph-black flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-proph-yellow border-t-transparent mx-auto" />
          <h2 className="text-2xl font-black text-proph-white">
            Building Your Proph
          </h2>
          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="flex items-center gap-3 text-proph-white">
              <CheckCircle2 className="w-5 h-5 text-proph-yellow" />
              <span>Analyzing your stats</span>
            </div>
            <div className="flex items-center gap-3 text-proph-white">
              <CheckCircle2 className="w-5 h-5 text-proph-yellow" />
              <span>Finding your college level</span>
            </div>
            <div className="flex items-center gap-3 text-proph-white">
              <div className="w-5 h-5 border-2 border-proph-yellow rounded-full animate-spin" />
              <span>Comparing to NBA players</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'reveal' && createdProfile) {
    return (
      <div className="min-h-screen bg-proph-black py-8 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-black text-proph-white mb-2">
              Your Proph is Ready!
            </h2>
            <p className="text-proph-grey-text">
              Here's how coaches will see you
            </p>
          </div>

          <div className="flex justify-center">
            <PlayerCardFinal1 
              player={createdProfile} 
              flippable={true}
              showReviewBadge={false}
            />
          </div>

          <div className="bg-proph-grey rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-proph-white mb-2">
                Your AI Evaluation
              </h3>
              <p className="text-proph-yellow text-xl font-black mb-1">
                {createdProfile.evaluation.level}
              </p>
              <p className="text-proph-grey-text text-sm">
                Based on your stats and position
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-proph-white mb-2">
                Playing Style Comparisons
              </h3>
              <p className="text-proph-white text-sm">
                Similar to: {createdProfile.evaluation.comparisons.join(', ')}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => navigate('/player/home')}
                className="flex-1 bg-proph-yellow text-proph-black font-bold py-3 px-4 rounded-lg hover:bg-[#E6D436] transition-colors"
              >
                Start Browsing
              </button>
              <button
                onClick={() => navigate('/player/profile')}
                className="flex-1 bg-proph-grey-light text-proph-white font-semibold py-3 px-4 rounded-lg hover:bg-proph-grey-light/80 transition-colors"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Steps 1-3 form
  const renderProgress = (step: number, total: number) => {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < step ? 'bg-proph-yellow' : 'bg-proph-grey-text/30'
                }`}
              />
            ))}
          </div>
          <span className="text-proph-grey-text text-sm">
            Step {step} of {total}
          </span>
          <div className="flex items-center gap-1 text-proph-grey-text text-sm">
            <Clock className="w-4 h-4" />
            <span>About {4 - step} minutes left</span>
          </div>
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="min-h-screen bg-proph-black py-8 px-4">
      <div className="max-w-lg mx-auto">
        {renderProgress(1, 4)}
        
        <h2 className="text-2xl font-black text-proph-white mb-2">
          Build Your Proph
        </h2>
        <p className="text-proph-grey-text mb-6">
          Let's start with the basics
        </p>

        <div className="bg-proph-grey rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-proph-white font-semibold text-sm mb-0.5">
              Full Name
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Marcus Johnson"
              className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-proph-white font-semibold text-sm mb-0.5">
                Height (ft)
              </label>
              <input
                type="number"
                min="4"
                max="8"
                value={profileData.heightFeet}
                onChange={(e) => setProfileData(prev => ({ ...prev, heightFeet: e.target.value }))}
                placeholder="6"
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
              />
            </div>
            <div>
              <label className="block text-proph-white font-semibold text-sm mb-0.5">
                Height (in)
              </label>
              <input
                type="number"
                min="0"
                max="11"
                value={profileData.heightInches}
                onChange={(e) => setProfileData(prev => ({ ...prev, heightInches: e.target.value }))}
                placeholder="2"
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
              />
            </div>
            <div>
              <label className="block text-proph-white font-semibold text-sm mb-0.5">
                Weight (lbs)
              </label>
              <input
                type="number"
                value={profileData.weight}
                onChange={(e) => setProfileData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="180"
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-proph-white font-semibold text-sm mb-0.5">
              Date of Birth <span className="text-proph-error">*</span>
            </label>
            <input
              type="date"
              value={profileData.dateOfBirth}
              onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
              className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
            />
          </div>

          <div>
            <label className="block text-proph-white font-semibold text-sm mb-2">
              Gender <span className="text-proph-error">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={profileData.gender === 'Male'}
                  onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-4 h-4 border-2 border-proph-grey-text/40 bg-proph-black text-proph-yellow focus:ring-2 focus:ring-proph-yellow/20 focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer checked:bg-proph-yellow checked:border-proph-yellow"
                />
                <span className="text-proph-white text-sm group-hover:text-proph-yellow transition-colors">Male</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={profileData.gender === 'Female'}
                  onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-4 h-4 border-2 border-proph-grey-text/40 bg-proph-black text-proph-yellow focus:ring-2 focus:ring-proph-yellow/20 focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer checked:bg-proph-yellow checked:border-proph-yellow"
                />
                <span className="text-proph-white text-sm group-hover:text-proph-yellow transition-colors">Female</span>
              </label>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep('step2')}
            disabled={!profileData.name || !profileData.heightFeet || !profileData.heightInches || !profileData.dateOfBirth || !profileData.gender}
            className={`w-full py-3 px-6 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 ${
              profileData.name && profileData.heightFeet && profileData.heightInches && profileData.dateOfBirth && profileData.gender
                ? 'bg-proph-yellow text-proph-black hover:bg-[#E6D436] active:scale-[0.98]'
                : 'bg-proph-grey-light text-proph-grey-text cursor-not-allowed opacity-50'
            }`}
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="min-h-screen bg-proph-black py-8 px-4">
      <div className="max-w-lg mx-auto">
        {renderProgress(2, 4)}
        
        <h2 className="text-2xl font-black text-proph-white mb-2">
          School Information
        </h2>
        <p className="text-proph-grey-text mb-6">
          Tell us about your school
        </p>

        <div className="bg-proph-grey rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-proph-white font-semibold text-sm mb-0.5">
              High School
            </label>
            <input
              type="text"
              value={profileData.highSchool}
              onChange={(e) => setProfileData(prev => ({ ...prev, highSchool: e.target.value }))}
              placeholder="Lincoln High School"
              className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-proph-white font-semibold text-sm mb-0.5">
                City
              </label>
              <input
                type="text"
                value={profileData.city}
                onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Chicago"
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
              />
            </div>
            <div>
              <label className="block text-proph-white font-semibold text-sm mb-0.5">
                State
              </label>
              <select
                value={profileData.state}
                onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
              >
                <option value="">Select State</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
                <option value="International">International</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-proph-white font-semibold text-sm mb-0.5">
              Graduation Year
            </label>
            <input
              type="number"
              value={profileData.classYear}
              onChange={(e) => setProfileData(prev => ({ ...prev, classYear: parseInt(e.target.value) || new Date().getFullYear() + 1 }))}
              className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
            />
          </div>

          <div>
            <label className="block text-proph-white font-semibold text-sm mb-0.5">
              Current Level of Play <span className="text-proph-error">*</span>
            </label>
            <select
              value={profileData.clop}
              onChange={(e) => setProfileData(prev => ({ ...prev, clop: e.target.value, division: '' }))}
              className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
            >
              <option value="">Please Select...</option>
              <option value="College">College</option>
              <option value="Prep">Prep</option>
              <option value="Varsity">Varsity</option>
              <option value="Junior Varsity">Junior Varsity</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Division field - shown conditionally based on clop selection */}
          {profileData.clop === 'College' && (
            <div>
              <label className="block text-proph-white font-semibold text-sm mb-0.5">
                Division <span className="text-proph-error">*</span>
              </label>
              <select
                value={profileData.division}
                onChange={(e) => setProfileData(prev => ({ ...prev, division: e.target.value }))}
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
              >
                <option value="">Select division...</option>
                <option value="D1">D1</option>
                <option value="D2">D2</option>
                <option value="D3">D3</option>
                <option value="NAIA">NAIA</option>
                <option value="JUCO">JUCO</option>
              </select>
            </div>
          )}

          {profileData.clop === 'Varsity' && (
            <div>
              <label className="block text-proph-white font-semibold text-sm mb-0.5">
                Division <span className="text-proph-error">*</span>
              </label>
              <input
                type="text"
                value={profileData.division}
                onChange={(e) => setProfileData(prev => ({ ...prev, division: e.target.value }))}
                placeholder="Ex: 6A, 4A, etc."
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
              />
            </div>
          )}

          <button
            onClick={() => setCurrentStep('step3')}
            disabled={
              !profileData.highSchool || 
              !profileData.city || 
              !profileData.state ||
              !profileData.clop || 
              (profileData.clop === 'College' && !profileData.division) ||
              (profileData.clop === 'Varsity' && !profileData.division)
            }
            className={`w-full py-3 px-6 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 ${
              profileData.highSchool && 
              profileData.city && 
              profileData.state &&
              profileData.clop &&
              ((profileData.clop === 'College' && profileData.division) ||
               (profileData.clop === 'Varsity' && profileData.division) ||
               (profileData.clop !== 'College' && profileData.clop !== 'Varsity'))
                ? 'bg-proph-yellow text-proph-black hover:bg-[#E6D436] active:scale-[0.98]'
                : 'bg-proph-grey-light text-proph-grey-text cursor-not-allowed opacity-50'
            }`}
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="min-h-screen bg-proph-black py-4 px-4">
      <div className="max-w-lg mx-auto">
        {renderProgress(3, 4)}
        
        <h2 className="text-2xl font-black text-proph-white mb-1">
          Your Stats
        </h2>
        <p className="text-proph-grey-text mb-2">
          Accuracy is everything
        </p>

        <div className="bg-proph-grey rounded-2xl p-4 space-y-4">
          <div className="border-b border-proph-grey-text/20 pb-4">
            <h3 className="text-proph-white font-bold mb-1">📊 Your Season Stats</h3>
            
            <StatsWarningBox />

            <div className="space-y-4">
            <div>
              <label className="block text-proph-white font-semibold text-sm mb-0.5">
                  Games Played
              </label>
              <input
                  type="number"
                  value={profileData.gamesPlayed}
                  onChange={(e) => setProfileData(prev => ({ ...prev, gamesPlayed: e.target.value }))}
                  placeholder="25"
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
              />
          </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-proph-white font-semibold text-sm mb-0.5">
                    PPG
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profileData.ppg}
                    onChange={(e) => setProfileData(prev => ({ ...prev, ppg: e.target.value }))}
                    placeholder="18.5"
                    className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                  />
                </div>
                <div>
                  <label className="block text-proph-white font-semibold text-sm mb-0.5">
                    RPG
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profileData.rpg}
                    onChange={(e) => setProfileData(prev => ({ ...prev, rpg: e.target.value }))}
                    placeholder="5.2"
                    className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                  />
                </div>
                <div>
                  <label className="block text-proph-white font-semibold text-sm mb-0.5">
                    APG
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profileData.apg}
                    onChange={(e) => setProfileData(prev => ({ ...prev, apg: e.target.value }))}
                    placeholder="4.8"
                    className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-proph-white font-semibold text-sm mb-0.5">
                    Steals
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profileData.steals}
                    onChange={(e) => setProfileData(prev => ({ ...prev, steals: e.target.value }))}
                    placeholder="2.1"
                    className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                  />
                </div>
                <div>
                  <label className="block text-proph-white font-semibold text-sm mb-0.5">
                    Blocks
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profileData.blocks}
                    onChange={(e) => setProfileData(prev => ({ ...prev, blocks: e.target.value }))}
                    placeholder="0.8"
                    className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-proph-white font-semibold text-sm mb-1">
                    Field Goals
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-proph-grey-text text-xs mb-0.5">
                        Made
                      </label>
                      <input
                        type="number"
                        value={profileData.fgm}
                        onChange={(e) => setProfileData(prev => ({ ...prev, fgm: e.target.value }))}
                        placeholder="150"
                        className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                      />
                </div>
                <div>
                      <label className="block text-proph-grey-text text-xs mb-0.5">
                        Attempted
                  </label>
                  <input
                    type="number"
                        value={profileData.fga}
                        onChange={(e) => setProfileData(prev => ({ ...prev, fga: e.target.value }))}
                        placeholder="300"
                    className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                  />
                    </div>
                </div>
              </div>

                <div>
                  <label className="block text-proph-white font-semibold text-sm mb-1">
                    3-Pointers
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-proph-grey-text text-xs mb-0.5">
                        Made
                  </label>
                  <input
                    type="number"
                        value={profileData.threepm}
                        onChange={(e) => setProfileData(prev => ({ ...prev, threepm: e.target.value }))}
                        placeholder="60"
                    className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                  />
                    </div>
                    <div>
                      <label className="block text-proph-grey-text text-xs mb-0.5">
                        Attempted
                      </label>
                      <input
                        type="number"
                        value={profileData.threepa}
                        onChange={(e) => setProfileData(prev => ({ ...prev, threepa: e.target.value }))}
                        placeholder="180"
                        className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                      />
                </div>
                  </div>
                </div>

                <div>
                  <label className="block text-proph-white font-semibold text-sm mb-1">
                    Free Throws
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-proph-grey-text text-xs mb-0.5">
                        Made
                  </label>
                  <input
                    type="number"
                        value={profileData.ftm}
                        onChange={(e) => setProfileData(prev => ({ ...prev, ftm: e.target.value }))}
                        placeholder="120"
                    className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                  />
                    </div>
                    <div>
                      <label className="block text-proph-grey-text text-xs mb-0.5">
                        Attempted
                      </label>
                      <input
                        type="number"
                        value={profileData.fta}
                        onChange={(e) => setProfileData(prev => ({ ...prev, fta: e.target.value }))}
                        placeholder="150"
                        className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consolidated High Stat Warning - shows above continue button */}
          {Object.keys(statWarnings).length > 0 && (
            <ConsolidatedHighStatWarning
              highStats={Object.entries(statWarnings).map(([key, warning]) => {
                const statNames: { [key: string]: string } = {
                  ppg: 'PPG',
                  rpg: 'RPG',
                  apg: 'APG',
                  steals: 'Steals',
                  blocks: 'Blocks',
                };
                const statValues: { [key: string]: string } = {
                  ppg: profileData.ppg,
                  rpg: profileData.rpg,
                  apg: profileData.apg,
                  steals: profileData.steals,
                  blocks: profileData.blocks,
                };
                return {
                  statName: statNames[key] || key,
                  value: parseFloat(statValues[key] || '0'),
                  threshold: warning.threshold,
                };
              })}
              onConfirm={handleAllStatsConfirm}
            />
          )}

          <button
            onClick={() => setCurrentStep('step4')}
            disabled={!canContinueStep2()}
            className={`w-full py-3 px-6 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 mt-5 ${
              canContinueStep2()
                ? 'bg-proph-yellow text-proph-black hover:bg-[#E6D436] active:scale-[0.98]'
                : 'bg-proph-grey-light text-proph-grey-text cursor-not-allowed opacity-50'
            }`}
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // Helper function to compress and resize image
  const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check file size first (max 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image is too large. Please use an image smaller than 5MB.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to create canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // Check final size (max 500KB after compression)
          const base64Size = (compressedDataUrl.length * 3) / 4;
          if (base64Size > 500 * 1024) {
            // Try again with lower quality
            const lowerQuality = quality * 0.7;
            const retryDataUrl = canvas.toDataURL('image/jpeg', lowerQuality);
            resolve(retryDataUrl);
          } else {
            resolve(compressedDataUrl);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    try {
      setIsCompressingImage(true);
      // Compress and resize the image before converting to base64
      const compressedDataUrl = await compressImage(file);
      setProfileData(prev => ({ ...prev, photo: compressedDataUrl }));
    } catch (error: any) {
      console.error('Error processing image:', error);
      alert(error.message || 'Failed to process image. Please try a different image.');
    } finally {
      setIsCompressingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const renderStep4 = () => (
    <div className="min-h-screen bg-proph-black py-8 px-4">
      <div className="max-w-lg mx-auto">
        {renderProgress(4, 4)}
        
        <h2 className="text-2xl font-black text-proph-white mb-2">
          Stand Out
        </h2>
        <p className="text-proph-grey-text mb-6">
          Add a photo and highlights to make your profile shine
        </p>

        <div className="bg-proph-grey rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-proph-white font-semibold text-sm mb-0.5">
              Photo <span className="text-proph-error">*</span>
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-proph-yellow bg-proph-yellow/10'
                  : 'border-proph-grey-text/20 hover:border-proph-grey-text/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              {isCompressingImage ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-proph-yellow"></div>
                  </div>
                  <p className="text-proph-white text-sm">Compressing image...</p>
                </div>
              ) : profileData.photo ? (
                <div className="space-y-2">
                  <img
                    src={profileData.photo}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded-lg object-cover"
                  />
                  <p className="text-proph-white text-sm">Click or drag to change photo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-10 h-10 text-proph-grey-text mx-auto" />
                  <div>
                    <p className="text-proph-white font-semibold text-sm mb-1">
                      Drag and drop your photo here
                    </p>
                    <p className="text-proph-grey-text text-xs">
                      or click to browse
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-proph-white font-semibold text-sm mb-0.5">
              Highlight Video URL (Optional)
            </label>
            <input
              type="url"
              value={profileData.highlightUrl}
              onChange={(e) => setProfileData(prev => ({ ...prev, highlightUrl: e.target.value }))}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
            />
          </div>

          <div>
            <p className="text-proph-grey-text text-xs mb-3">
              Note: Academic information is only visible to coaches. Some postings have academic requirements.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-proph-white font-semibold text-sm mb-0.5">
                  GPA (Optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profileData.gpa}
                  onChange={(e) => setProfileData(prev => ({ ...prev, gpa: e.target.value }))}
                  placeholder="3.8"
                  className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                />
              </div>
              <div>
                <label className="block text-proph-white font-semibold text-sm mb-0.5">
                  SAT (Optional)
                </label>
                <input
                  type="number"
                  value={profileData.sat}
                  onChange={(e) => setProfileData(prev => ({ ...prev, sat: e.target.value }))}
                  placeholder="1250"
                  className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                />
              </div>
              <div>
                <label className="block text-proph-white font-semibold text-sm mb-0.5">
                  ACT (Optional)
                </label>
                <input
                  type="number"
                  value={profileData.act}
                  onChange={(e) => setProfileData(prev => ({ ...prev, act: e.target.value }))}
                  placeholder="28"
                  className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateProfile}
            disabled={!profileData.photo}
            className={`w-full py-3 px-6 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 mt-6 ${
              profileData.photo
                ? 'bg-proph-yellow text-proph-black hover:bg-[#E6D436] active:scale-[0.98]'
                : 'bg-proph-grey-light text-proph-grey-text cursor-not-allowed opacity-50'
            }`}
          >
            Create My Proph 🏀
          </button>
        </div>
      </div>
    </div>
  );

  switch (currentStep) {
    case 'step1':
      return renderStep1();
    case 'step2':
      return renderStep2();
    case 'step3':
      return renderStep3();
    case 'step4':
      return renderStep4();
    default:
      return null;
  }
};


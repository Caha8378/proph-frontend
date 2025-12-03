import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchoolSearchStep } from '../../components/onboarding/SchoolSearchStep';
import { GenderRoleStep } from '../../components/onboarding/GenderRoleStep';
import { CheckCircle, Loader2 } from 'lucide-react';
import type { School } from '../../types';
import * as coachesService from '../../api/coaches';
import { useNotification } from '../../hooks';
import { useAuth } from '../../context/authContext';
import { normalizeBackendUser, logout } from '../../api/auth';

// Local School type for onboarding (extends the main School type)
interface OnboardingSchool extends Omit<School, 'id' | 'logo' | 'division' | 'location'> {
  id?: string;
  name: string;
  state?: string;
  city?: string;
  division?: string;
  conference?: string;
  website?: string;
  email_domain?: string;
  logo_url?: string;
  logoFile?: File;
  isManual?: boolean;
}

type Step = 1 | 2 | 'processing' | 'success';

export const CoachOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user, setUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedSchool, setSelectedSchool] = useState<OnboardingSchool | null>(null);
  const [name, setName] = useState<string>('');
  const [genderCoached, setGenderCoached] = useState<'mens' | 'womens' | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState<string>('');
  
  // Get user email and userId from the current user object in localStorage or auth context
  const storedUser = user || (() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  })();

  const userEmail = storedUser?.email || 'coach@example.com';
  const userId = storedUser?.id || null;

  const handleSchoolSelect = (school: School | null) => {
    setSelectedSchool(school);
  };

  const handleManualSchool = (school: Omit<School, 'id'> & { isManual: true; logoFile?: File }) => {
    setSelectedSchool({ ...school, id: undefined });
  };

  const handleSubmit = async () => {
    if (!selectedSchool || !name.trim() || !genderCoached || !role) {
      showNotification('Please complete all required fields', 'error');
      return;
    }

    setCurrentStep('processing');

    try {
      // Determine final role (use customRole if role is 'Other')
      const finalRole = role === 'Other' ? customRole.trim() : role;
      if (!finalRole) {
        throw new Error('Please specify your role');
      }

      // Map gender: 'mens' -> 'male', 'womens' -> 'female'
      const genderCoachedValue: 'male' | 'female' = genderCoached === 'mens' ? 'male' : 'female';

      // Handle school creation/selection
      let schoolId: number;
      
      if (selectedSchool.isManual) {
        // Create new school first
        if (!selectedSchool.name || !selectedSchool.state || !selectedSchool.logoFile) {
          throw new Error('Please complete all required school fields including logo upload');
        }

        const schoolData: coachesService.CreateSchoolData = {
          name: selectedSchool.name,
          state: selectedSchool.state,
          city: selectedSchool.city,
          division: selectedSchool.division,
          conference: selectedSchool.conference,
          website: selectedSchool.website,
          logo: selectedSchool.logoFile,
        };

        const schoolResult = await coachesService.createSchool(schoolData);
        schoolId = schoolResult.school_id;
      } else {
        // Use existing school from dropdown
        if (!selectedSchool.id) {
          throw new Error('Please select a school from the dropdown');
        }
        schoolId = parseInt(selectedSchool.id);
      }

      // Prepare data for backend
      const registerData: coachesService.RegisterCoachData = {
        userId: userId ? parseInt(String(userId)) : undefined,
        school_id: schoolId,
        name: name.trim(),
        position_title: finalRole,
        gender_coached: genderCoachedValue,
        // phone_number not collected in onboarding
      };

      // Call backend API to register coach
      // Backend returns both profile and user object with updated account_status
      const result = await coachesService.registerCoach(registerData);
      const profile = result.profile;
      
      // Update localStorage with the new account_status from backend response
      if (result.user) {
        // Merge with existing user data to preserve account_type from signup
        const existingUser = storedUser || (() => {
          const userStr = localStorage.getItem('user');
          return userStr ? JSON.parse(userStr) : null;
        })();
        
        const normalizedUser = normalizeBackendUser({
          ...existingUser, // Preserve existing data (especially account_type)
          ...result.user,  // Override with new data (especially account_status)
        });
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        
        // Also update auth context immediately so user doesn't get redirected
        // Convert backend user format to frontend format for context
        // Use existing account_type if backend didn't provide it
        const accountType = normalizedUser.account_type || existingUser?.account_type || 'coach';
        const frontendUser = {
          id: normalizedUser.id,
          email: normalizedUser.email,
          role: accountType === 'coach' ? 'coach' as const : 'player' as const,
          accountStatus: normalizedUser.account_status as 'active' | 'inactive' | null,
          verified: false, // Will be determined from profile
          profileComplete: true, // Profile was just created
          emailVerified: normalizedUser.email_verified,
          genderCoached: normalizedUser.gender_coached,
        };
        setUser(frontendUser);
      }

      // Check verification status (backend may set this automatically based on email domain)
      const isVerified = profile.is_verified === true || profile.is_verified === 1;

      // Store coach profile data (legacy - may not be needed with account_status)
      localStorage.setItem('coachProfileComplete', 'true');
      localStorage.setItem('coachVerified', String(isVerified));

      if (isVerified) {
        setCurrentStep('success');
        setTimeout(() => {
          navigate('/coach/home');
        }, 1500);
      } else {
        navigate('/coach/home');
      }
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
      showNotification(error.message || 'Failed to complete onboarding. Please try again.', 'error');
      setCurrentStep(2); // Go back to step 2
    }
  };

  if (currentStep === 'processing') {
    return (
      <div className="min-h-screen bg-proph-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6">
            <Loader2 className="w-full h-full text-proph-yellow animate-spin" />
          </div>
          <p className="text-2xl font-black text-proph-white">
            Setting Up Your Profile...
          </p>
        </div>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-proph-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6">
            <CheckCircle className="w-full h-full text-proph-yellow" />
          </div>
          <p className="text-2xl font-black text-proph-white mb-2">
            Verifying Your Account...
          </p>
          <p className="text-proph-grey-text">
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const handleReset = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-proph-black py-8 px-4">
      {/* Proph Logo Reset Button */}
      <div className="max-w-2xl mx-auto mb-4 flex justify-center">
        <button
          onClick={handleReset}
          className="active:scale-95 transition-transform"
          aria-label="Reset and return to home"
        >
          <h1
            className="text-2xl md:text-3xl font-extrabold text-proph-yellow"
            style={{ textShadow: '0 0 10px rgba(255, 236, 60, 0.5)', letterSpacing: '-1px' }}
          >
            Proph
          </h1>
        </button>
      </div>
      
      <div className="max-w-2xl mx-auto bg-proph-grey rounded-2xl p-8">
        {currentStep === 1 ? (
          <SchoolSearchStep
            selectedSchool={selectedSchool as any}
            onSchoolSelect={handleSchoolSelect as any}
            onManualSchool={handleManualSchool as any}
            userEmail={userEmail}
            onContinue={() => setCurrentStep(2)}
          />
        ) : (
          <GenderRoleStep
            selectedSchool={selectedSchool as any}
            name={name}
            genderCoached={genderCoached}
            role={role}
            customRole={customRole}
            userEmail={userEmail}
            onNameChange={setName}
            onGenderChange={setGenderCoached}
            onRoleChange={setRole}
            onCustomRoleChange={setCustomRole}
            onBack={() => setCurrentStep(1)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};


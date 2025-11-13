import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Megaphone, Check, LogIn, UserPlus, Eye, MessageCircle, Target, ArrowRight, X as XIcon } from 'lucide-react';
import { PlayerProfileModal } from '../components/player/PlayerProfileModal';
import { useAuth } from '../context/authContext';
import { getTotalPlayerCards } from '../api/players';
import { PlayerCardFinal1 } from '../components/player/PlayerCardFinal1';
import { PostingCardHorizontalMini } from '../components/posting/PostingCardHorizontalMini';
import { ApplicationCardV1 } from '../components/application/ApplicationCardV1';
import type { PlayerProfile, Posting, Coach, Application } from '../types';

// Quick Evaluation Quiz Component
const QuickEvalQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [quizExpanded, setQuizExpanded] = useState(false);
  const [quizData, setQuizData] = useState({
    email: '',
    gender: '',
    heightFeet: '',
    heightInches: '',
    weight: '',
    graduationYear: ''
  });

  const handleSubmit = () => {
    // Store quiz data in localStorage
    localStorage.setItem('quizData', JSON.stringify(quizData));
    
    // Redirect to signup
    navigate('/signup');
  };

  // Collapsed state
  if (!quizExpanded) {
    return (
      <div className="mt-8 max-w-2xl mx-auto">
        <button
          onClick={() => setQuizExpanded(true)}
          className="w-full bg-proph-black/90 backdrop-blur rounded-2xl px-4 py-3 text-left text-proph-grey-text hover:bg-proph-black transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-proph-yellow" />
            <span className="text-lg">I'm a 6'2", 180lb player from...</span>
            <ArrowRight className="w-5 h-5 ml-auto text-proph-yellow group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    );
  }

  // Expanded quiz form
  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <div className="bg-proph-black/90 backdrop-blur rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-proph-white mb-3">Get Your Free AI Evaluation</h3>
        
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-proph-grey-text mb-1">Email</label>
          <input 
            type="email"
            placeholder="your.email@example.com"
            value={quizData.email}
            onChange={(e) => setQuizData({...quizData, email: e.target.value})}
            className="w-full bg-proph-grey border border-proph-grey-text/20 rounded-lg px-2 py-3 text-proph-white placeholder:text-proph-grey-text focus:outline-none focus:border-proph-yellow transition-colors"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-proph-grey-text mb-1">Gender</label>
          <select 
            value={quizData.gender}
            onChange={(e) => setQuizData({...quizData, gender: e.target.value})}
            className="w-full bg-proph-grey border border-proph-grey-text/20 rounded-lg px-2 py-3 text-proph-white focus:outline-none focus:border-proph-yellow transition-colors"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-semibold text-proph-grey-text mb-1">Height</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input 
                type="number"
                placeholder="6"
                min="4"
                max="8"
                value={quizData.heightFeet}
                onChange={(e) => setQuizData({...quizData, heightFeet: e.target.value})}
                className="w-full bg-proph-grey border border-proph-grey-text/20 rounded-lg px-2 py-3 text-proph-white placeholder:text-proph-grey-text focus:outline-none focus:border-proph-yellow transition-colors"
              />
              <p className="text-xs text-proph-grey-text mt-1">Feet</p>
            </div>
            <div>
              <input 
                type="number"
                placeholder="2"
                min="0"
                max="11"
                value={quizData.heightInches}
                onChange={(e) => setQuizData({...quizData, heightInches: e.target.value})}
                className="w-full bg-proph-grey border border-proph-grey-text/20 rounded-lg px-2 py-3 text-proph-white placeholder:text-proph-grey-text focus:outline-none focus:border-proph-yellow transition-colors"
              />
              <p className="text-xs text-proph-grey-text mt-1">Inches</p>
            </div>
          </div>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-semibold text-proph-grey-text mb-1">Weight (lbs)</label>
          <input 
            type="number"
            placeholder="180"
            value={quizData.weight}
            onChange={(e) => setQuizData({...quizData, weight: e.target.value})}
            className="w-full bg-proph-grey border border-proph-grey-text/20 rounded-lg px-2 py-3 text-proph-white placeholder:text-proph-grey-text focus:outline-none focus:border-proph-yellow transition-colors"
          />
        </div>

        {/* Graduation Year */}
        <div>
          <label className="block text-sm font-semibold text-proph-grey-text mb-2">Graduation Year</label>
          <select 
            value={quizData.graduationYear}
            onChange={(e) => setQuizData({...quizData, graduationYear: e.target.value})}
            className="w-full bg-proph-grey border border-proph-grey-text/20 rounded-lg px-2 py-3 text-proph-white focus:outline-none focus:border-proph-yellow transition-colors"
          >
            <option value="">Select year</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!quizData.email || !quizData.gender || !quizData.heightFeet || !quizData.heightInches || !quizData.weight || !quizData.graduationYear}
          className="w-full bg-proph-yellow text-proph-black font-bold py-3 rounded-lg hover:bg-proph-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
        >
          Complete Your Proph to Find Your Fit
        </button>

        <button
          onClick={() => setQuizExpanded(false)}
          className="w-full text-sm text-proph-grey-text hover:text-proph-white transition-colors py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Mock data for demo components
const mockPlayerProfile: PlayerProfile = {
  id: 'demo-1',
  userId: 1,
  name: 'Coby Gold',
  position: 'Knockdown 3-Level Scorer',
  photo: '/demoCoby.jpeg',
  school: 'Kent Denver',
  height: "6'2\"",
  weight: 180,
  age: 19,
  location: 'Denver, CO',
  classYear: 2019,
  evaluation: {
    level: 'D2',
    comparisons: ['James Harden', 'Goran Dragic', 'Darius Garland']
  },
  stats: {
    ppg: 21,
    rpg: 2.5,
    apg: 4.5,
    fgPercentage: 0.45,
    threePtPercentage: 0.38,
    ftPercentage: 0.82,
    steals: 2.1,
    blocks: 0.5
  },
  gpa: 3.5,
  verified: true
};

const mockPosting: Posting = {
  id: 'demo-posting-1',
  school: {
    id: '1',
    name: 'Macalester',
    logo: '/logo_macalester.png',
    division: 'D3',
    location: 'St. Paul, MN',
    conference: 'MIAC'
  },
  position: 'Guard',
  requirements: {
    height: "6'0\"+",
    classYear: 2019,
    gpa: 3.5
  },
  deadline: '2026-05-15',
  applicantCount: 12,
  description: 'Looking for a guard who can contribute to our program.',
  coachName: 'Abe Woldeslassie',
  createdAt: '2025-01-15',
  status: 'active'
};

const mockPosting2: Posting = {
  id: 'demo-posting-2',
  school: {
    id: '2',
    name: 'Colorado School of Mines',
    logo: '/colorado_school_of_mines.png',
    division: 'D2',
    location: 'Golden, CO',
    conference: 'RMAC'
  },
  position: 'Guard',
  requirements: {
    height: "6'2\"+",
    classYear: 2019,
    gpa: undefined
  },
  deadline: '2026-05-20',
  applicantCount: 8,
  description: 'Seeking a guard for our program.',
  coachName: 'Coach Smith',
  createdAt: '2025-01-20',
  status: 'active'
};

const mockPosting3: Posting = {
  id: 'demo-posting-3',
  school: {
    id: '3',
    name: 'Eastern Washington',
    logo: '/Eastern_Washington.png',
    division: 'D1',
    location: 'Cheney, WA',
    conference: 'Big Sky'
  },
  position: 'Guard',
  requirements: {
    height: "6'1\"+",
    classYear: 2019,
    gpa: 3.2
  },
  deadline: '2026-05-25',
  applicantCount: 15,
  description: 'Looking for a skilled guard to join our program.',
  coachName: 'Coach Riley',
  createdAt: '2025-01-22',
  status: 'active'
};

const mockApplication: Application = {
  id: 'demo-app-1',
  posting: mockPosting,
  player: mockPlayerProfile,
  status: 'accepted',
  appliedAt: '2025-01-18T10:00:00Z'
};

const mockApplication2: Application = {
  id: 'demo-app-2',
  posting: mockPosting2,
  player: mockPlayerProfile,
  status: 'pending',
  appliedAt: '2025-01-20T14:30:00Z',
  applicationMessage: 'I am very interested in your program and would love the opportunity to contribute to your team.'
};

const mockCoach: Coach = {
  id: 'demo-coach-1',
  name: 'Abe Woldeslassie',
  school: {
    id: '1',
    name: 'Macalester',
    logo: '/logo_macalester.png',
    division: 'D3',
    location: 'St. Paul, MN'
  },
  position: 'Head Coach',
  verified: true
};


export const LandingPage2: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'players' | 'coaches'>('players');
  const [playerCount, setPlayerCount] = useState(0);
  const playerParam = searchParams.get('player');
  
  // Redirect coaches to their home page
  useEffect(() => {
    if (user && user.role === 'coach') {
      navigate('/coach/home', { replace: true });
    }
  }, [user, navigate]);

  // Fetch total player cards count from API
  useEffect(() => {
    const fetchPlayerCount = async () => {
      try {
        const count = await getTotalPlayerCards();
        setPlayerCount(count);
      } catch (error) {
        console.error('Error fetching player count:', error);
        // Keep default 0 if API fails
      }
    };
    fetchPlayerCount();
  }, []);

  const closeModal = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('player');
    navigate(`?${next.toString()}`, { replace: false });
  };

  return (
    <div className="min-h-screen bg-proph-black text-proph-white">
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-[70] bg-proph-grey/95 backdrop-blur-sm border-b border-proph-grey-text/20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="active:scale-95 transition-transform">
            <h1 
              className="text-2xl font-extrabold text-proph-yellow" 
              style={{ textShadow: '0 0 10px rgba(255, 236, 60, 0.5)', letterSpacing: '-2px' }}
            >
              Proph
            </h1>
          </button>

          {/* Auth buttons */}
          <nav className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg hover:bg-proph-grey-light active:scale-95 transition-all flex items-center gap-1.5 text-sm font-semibold text-proph-white"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="px-5 py-2.5 rounded-lg bg-proph-yellow text-proph-black active:scale-95 transition-all text-sm font-bold shadow-lg shadow-proph-yellow/20"
            >
              <UserPlus className="w-4 h-4 inline mr-1.5" />
              Sign Up
            </button>
          </nav>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="bg-proph-yellow text-proph-black min-h-[85vh] flex flex-col justify-center py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Proph Logo with Bounce */}
          <div className="flex justify-center mb-4 animate-bounce-subtle" aria-hidden="true">
            <img
              src="/prophLogo.png"
              alt="Proph logo"
              className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain"
            />
          </div>

          {/* Hero Headline */}
          <h2 className="text-[clamp(1.25rem,3.5vw,3.5rem)] font-black leading-[1.1] mb-6 px-4 text-center">
            Every hooper needs the right fit.<br />Find yours here.
          </h2>

          {/* Interactive Quiz */}
          <QuickEvalQuiz />

          {/* Cards Created Counter */}
          <div className="mt-8">
            <p className="text-base md:text-lg font-light text-proph-black mb-2">
              Cards created
            </p>
            <p className="text-3xl md:text-4xl font-light text-proph-black transition-all duration-500">
              {playerCount.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS - Tabbed Section */}
      <section className="bg-proph-black py-20">
        <div className="max-w-10xl mx-auto px-4">
          <h3 className="text-4xl md:text-5xl font-black text-center mb-4">How It Works</h3>
          <p className="text-center text-proph-grey-text text-lg mb-12 max-w-2xl mx-auto">
            Built for players and coaches who want results, not promises
          </p>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-2 mb-12">
            <button
              onClick={() => setActiveTab('players')}
              className={`px-8 py-3 rounded-lg font-bold transition-all active:scale-95 ${
                activeTab === 'players'
                  ? 'bg-proph-yellow text-proph-black'
                  : 'bg-proph-black text-proph-white hover:bg-proph-grey-light'
              }`}
            >
              For Players
            </button>
            <button
              onClick={() => setActiveTab('coaches')}
              className={`px-8 py-3 rounded-lg font-bold transition-all active:scale-95 ${
                activeTab === 'coaches'
                  ? 'bg-proph-yellow text-proph-black'
                  : 'bg-proph-black text-proph-white hover:bg-proph-grey-light'
              }`}
            >
              For Coaches
            </button>
          </div>

          {/* Players Tab Content */}
          {activeTab === 'players' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-6">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-proph-yellow flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-proph-black" />
                </div>
                <h4 className="text-xl font-bold mb-2 text-center">Create Your Profile</h4>
                <p className="text-sm text-proph-grey-text mb-4 text-center max-w-xs">
                  Create your profile and get your digital basketball resume, evaluated by our AI to find the perfect fit for you.
                </p>
                <div className="w-full flex justify-center -mx-8 md:-mx-12 lg:-mx-16">
                  <PlayerCardFinal1 
                    player={mockPlayerProfile} 
                    flippable={false}
                    showReviewBadge={false}
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-proph-yellow flex items-center justify-center flex-shrink-0">
                  <Target className="w-8 h-8 text-proph-black" />
                </div>
                <h4 className="text-xl font-bold mb-2 text-center">Apply to Postings</h4>
                <p className="text-sm text-proph-grey-text mb-4 text-center max-w-xs">
                  Apply to postings from real, verified coaching staffs.
                </p>
                <div className="w-full flex flex-col gap-3 items-center">
                  <PostingCardHorizontalMini 
                    posting={mockPosting}
                    onApply={() => {}}
                    hasApplied={false}
                  />
                  <PostingCardHorizontalMini 
                    posting={mockPosting2}
                    onApply={() => {}}
                    hasApplied={false}
                  />
                  <PostingCardHorizontalMini 
                    posting={mockPosting3}
                    onApply={() => {}}
                    hasApplied={false}
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-proph-yellow flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-8 h-8 text-proph-black" />
                </div>
                <h4 className="text-xl font-bold mb-2 text-center">Connect & Message</h4>
                <p className="text-sm text-proph-grey-text mb-4 text-center max-w-xs">
                  Connect and message with coaches you know are already interested in you.
                </p>
                <div className="w-full flex flex-col gap-3 items-center">
                  <ApplicationCardV1 
                    application={mockApplication}
                    onMessage={async () => {}}
                    onWithdraw={async () => {}}
                    onRemove={async () => {}}
                  />
                  <ApplicationCardV1 
                    application={mockApplication2}
                    onMessage={async () => {}}
                    onWithdraw={async () => {}}
                    onRemove={async () => {}}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Coaches Tab Content */}
          {activeTab === 'coaches' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-6">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-proph-yellow flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-8 h-8 text-proph-black" />
                </div>
                <h4 className="text-xl font-bold mb-2 text-center">Create a Posting</h4>
                <p className="text-sm text-proph-grey-text mb-4 text-center max-w-xs">
                  Create a posting to find the exact fit you need for your program.
                </p>
                <div className="w-full max-w-md mx-auto">
                  <div className="bg-proph-grey rounded-2xl overflow-hidden border border-proph-grey-text/20">
                    {/* Preview of CreatePostingModal content */}
                    <div className="flex flex-col" style={{ height: '500px' }}>
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-proph-grey-text/10 bg-proph-grey flex-shrink-0">
                        <div className="w-9"></div>
                        <div className="text-proph-white font-bold">Create Posting</div>
                        <div className="w-9"></div>
                      </div>
                      {/* Body Preview */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-proph-white mb-2">Position *</label>
                          <div className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-grey-text">
                            Point Guard
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-proph-white mb-2">Graduation Year *</label>
                          <div className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-grey-text">
                            2026
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-proph-white mb-2">Minimum GPA</label>
                          <div className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-grey-text">
                            3.0
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-proph-white mb-2">Minimum Height (Optional)</label>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="block text-xs text-proph-grey-text mb-1">Feet</label>
                              <div className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-grey-text">6</div>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-proph-grey-text mb-1">Inches</label>
                              <div className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-grey-text">2</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Footer */}
                      <div className="p-4 border-t border-proph-grey-text/10 bg-proph-grey flex-shrink-0">
                        <button disabled className="w-full bg-proph-yellow text-proph-black font-bold py-3 rounded-xl opacity-75">
                          Publish Posting
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-proph-yellow flex items-center justify-center flex-shrink-0">
                  <Eye className="w-8 h-8 text-proph-black" />
                </div>
                <h4 className="text-xl font-bold mb-2 text-center">Review Applications</h4>
                <p className="text-sm text-proph-grey-text mb-4 text-center max-w-xs">
                  Review applications from qualified athletes.
                </p>
                <div className="w-full flex flex-col items-center gap-4 -mx-8 md:-mx-12 lg:-mx-16">
                  <PlayerCardFinal1 
                    player={mockPlayerProfile} 
                    flippable={false}
                    showReviewBadge={false}
                  />
                  <div className="w-full max-w-[315px] flex gap-2">
                    <button 
                      disabled
                      className="flex-1 bg-proph-black text-proph-yellow font-semibold text-sm md:text-base py-2.5 md:py-3 px-4 md:px-6 rounded-lg opacity-75 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Check className="w-3 h-3 md:w-4 md:h-4" />Accept
                    </button>
                    <button 
                      disabled
                      className="flex-1 bg-proph-black text-proph-white font-semibold text-sm md:text-base py-2.5 md:py-3 px-4 md:px-6 rounded-lg opacity-75 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <XIcon className="w-3 h-3 md:w-4 md:h-4" />Dismiss
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-proph-yellow flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-8 h-8 text-proph-black" />
                </div>
                <h4 className="text-xl font-bold mb-2 text-center">Connect & Message</h4>
                <p className="text-sm text-proph-grey-text mb-4 text-center max-w-xs">
                  Connect and message with players you know are qualified for your program.
                </p>
                <div className="w-full max-w-md mx-auto">
                  <div className="bg-proph-grey rounded-2xl overflow-hidden border border-proph-grey-text/20">
                    {/* Preview of AcceptModal content */}
                    <div className="flex flex-col" style={{ height: '500px' }}>
                      {/* Header */}
                      <div className="p-4 bg-proph-grey border-b border-proph-grey-text/10 relative">
                        <div className="flex items-center gap-3">
                          <img 
                            src={mockPlayerProfile.photo} 
                            alt={mockPlayerProfile.name} 
                            className="w-12 h-12 rounded-full object-cover" 
                          />
                          <div className="min-w-0 pr-8">
                            <p className="text-proph-white font-bold truncate">
                              Accept {mockPlayerProfile.name}?
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Body Preview */}
                      <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                        <p className="text-proph-white text-sm leading-relaxed">
                          This will notify {mockPlayerProfile.name} that you're interested and open direct communication. You can continue the conversation through the Recruit tab in Proph.
                        </p>
                        <div>
                          <label className="block text-sm font-semibold text-proph-white mb-2">
                            Message *
                          </label>
                          <div className="w-full min-h-40 bg-proph-black border border-proph-yellow rounded-lg p-3 text-sm text-proph-grey-text">
                            Hey {mockPlayerProfile.name},<br/><br/>
                            We're interested in having you play {mockPosting.position} at {mockPosting.school.name}. Let's talk about fit.<br/><br/>
                            You can message me directly through Proph - check your Recruit tab for our conversation.<br/><br/>
                            - Coach {mockCoach.name}
                          </div>
                          <div className="text-right text-xs text-proph-grey-text mt-1">245/500</div>
                        </div>
                      </div>
                      {/* Footer */}
                      <div className="bg-proph-grey p-4 space-y-2">
                        <button disabled className="w-full bg-proph-success text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 opacity-75">
                          Accept & Send Message
                        </button>
                        <button disabled className="w-full border-2 border-proph-grey-text text-proph-white font-semibold py-3 rounded-xl opacity-50">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Button Below Steps */}
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-12 py-4 rounded-xl bg-proph-yellow text-proph-black font-black text-lg hover:bg-proph-yellow/90 active:scale-95 transition-all shadow-lg shadow-proph-yellow/20"
            >
              {activeTab === 'players' ? 'Start Your Free Profile' : 'Post Your First Opening'}
            </button>
          </div>
        </div>
      </section>

      {/* 4. WHY PROPH WINS - Outcome-Focused Benefits */}
      <section className="bg-proph-black py-20 border-t-4 border-proph-yellow">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-4xl md:text-5xl font-black text-center text-proph-yellow mb-4">
            Why Players Choose Proph
          </h3>
          <p className="text-center text-xl text-proph-grey-text max-w-3xl mx-auto mb-12">
            Stop wasting time on dream schools that'll never recruit you
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Benefit 1: Know Your Level */}
            <div className="bg-proph-grey rounded-2xl p-8 border-2 border-proph-yellow/20 hover:border-proph-yellow/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-proph-yellow flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-proph-black" />
              </div>
              <h4 className="text-2xl font-bold mb-3">Know Your Level</h4>
              <p className="text-proph-grey-text">
                Our AI projects whether you're D1, D2, D3, or NAIA material—based on real data, not hype.
              </p>
            </div>

            {/* Benefit 2: Apply Smarter */}
            <div className="bg-proph-grey rounded-2xl p-8 border-2 border-proph-yellow/20 hover:border-proph-yellow/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-proph-yellow flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-proph-black" />
              </div>
              <h4 className="text-2xl font-bold mb-3">Apply Smarter</h4>
              <p className="text-proph-grey-text">
                Only see programs actively recruiting your position and skill level. No more ghosting.
              </p>
            </div>

            {/* Benefit 3: Get Noticed */}
            <div className="bg-proph-grey rounded-2xl p-8 border-2 border-proph-yellow/20 hover:border-proph-yellow/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-proph-yellow flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-proph-black" />
              </div>
              <h4 className="text-2xl font-bold mb-3">Get Noticed</h4>
              <p className="text-proph-grey-text">
                Coaches see your full profile, stats, and highlights. No agent fees. No gatekeepers.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-12 py-4 rounded-xl bg-proph-yellow text-proph-black font-black text-lg hover:bg-proph-yellow/90 active:scale-95 transition-all shadow-lg shadow-proph-yellow/20"
            >
              See Your Projected Level — Free
            </button>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA - Strong Close */}
      <section className="bg-proph-yellow py-24 text-center text-proph-black">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-5xl md:text-6xl font-black mb-4">
            Ready to Take Control of Your Recruiting?
          </h3>
          <p className="text-xl font-semibold text-proph-black/80 mb-8">
            Join {playerCount.toLocaleString()} players already on Proph
          </p>
          <button 
            onClick={() => navigate('/signup')}
            className="rounded-xl font-black bg-proph-black text-proph-yellow px-16 py-5 text-lg hover:bg-proph-black/90 active:scale-95 transition-all shadow-2xl"
          >
            Create Your Free Profile
          </button>
          <p className="mt-6 text-sm text-proph-black/70">
            No credit card required • Takes 2 minutes
          </p>
        </div>
      </section>

      {/* Modal: player param */}
      <PlayerProfileModal 
        playerId={playerParam}
        isOpen={!!playerParam} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default LandingPage2;


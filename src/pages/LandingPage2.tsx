import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Megaphone, Check, LogIn, UserPlus, ArrowRight, Target, Eye, MessageCircle } from 'lucide-react';
import { PlayerProfileModal } from '../components/player/PlayerProfileModal';
import { useAuth } from '../context/authContext';

// Quick Evaluation Quiz Component
const QuickEvalQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [quizExpanded, setQuizExpanded] = useState(false);
  const [quizData, setQuizData] = useState({
    position: '',
    height: '',
    classYear: '',
    gpa: ''
  });

  const handleSubmit = () => {
    const params = new URLSearchParams({
      position: quizData.position,
      height: quizData.height,
      classYear: quizData.classYear,
      gpa: quizData.gpa || '',
      role: 'player'
    });
    navigate(`/signup?${params.toString()}`);
  };

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      {/* Collapsed State: Search-style input */}
      {!quizExpanded && (
        <button
          onClick={() => setQuizExpanded(true)}
          className="w-full bg-proph-black/90 backdrop-blur rounded-2xl px-6 py-5 text-left text-proph-grey-text hover:bg-proph-black transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-proph-yellow" />
            <span className="text-lg">I'm a 6'2" point guard from California...</span>
            <ArrowRight className="w-5 h-5 ml-auto text-proph-yellow group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      )}

      {/* Expanded State: Quick form */}
      {quizExpanded && (
        <div className="bg-proph-black/90 backdrop-blur rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-proph-white mb-4">Get Your Free AI Evaluation</h3>
          
          {/* Position */}
          <div>
            <label className="block text-sm font-semibold text-proph-grey-text mb-2">Position</label>
            <select 
              value={quizData.position}
              onChange={(e) => setQuizData({...quizData, position: e.target.value})}
              className="w-full bg-proph-grey border border-proph-grey-text/20 rounded-lg px-4 py-3 text-proph-white focus:outline-none focus:border-proph-yellow transition-colors"
            >
              <option value="">Select position</option>
              <option value="PG">Point Guard</option>
              <option value="SG">Shooting Guard</option>
              <option value="SF">Small Forward</option>
              <option value="PF">Power Forward</option>
              <option value="C">Center</option>
            </select>
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-semibold text-proph-grey-text mb-2">Height</label>
            <input 
              type="text"
              placeholder="6'2&quot;"
              value={quizData.height}
              onChange={(e) => setQuizData({...quizData, height: e.target.value})}
              className="w-full bg-proph-grey border border-proph-grey-text/20 rounded-lg px-4 py-3 text-proph-white placeholder:text-proph-grey-text focus:outline-none focus:border-proph-yellow transition-colors"
            />
          </div>

          {/* Class Year */}
          <div>
            <label className="block text-sm font-semibold text-proph-grey-text mb-2">Graduation Year</label>
            <select 
              value={quizData.classYear}
              onChange={(e) => setQuizData({...quizData, classYear: e.target.value})}
              className="w-full bg-proph-grey border border-proph-grey-text/20 rounded-lg px-4 py-3 text-proph-white focus:outline-none focus:border-proph-yellow transition-colors"
            >
              <option value="">Select year</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
            </select>
          </div>

          {/* GPA */}
          <div>
            <label className="block text-sm font-semibold text-proph-grey-text mb-2">GPA (optional)</label>
            <input 
              type="text"
              placeholder="3.5"
              value={quizData.gpa}
              onChange={(e) => setQuizData({...quizData, gpa: e.target.value})}
              className="w-full bg-proph-grey border border-proph-grey-text/20 rounded-lg px-4 py-3 text-proph-white placeholder:text-proph-grey-text focus:outline-none focus:border-proph-yellow transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!quizData.position || !quizData.height || !quizData.classYear}
            className="w-full bg-proph-yellow text-proph-black font-bold py-4 rounded-lg hover:bg-proph-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
          >
            See My Projected Level — Free
          </button>

          <button
            onClick={() => setQuizExpanded(false)}
            className="w-full text-sm text-proph-grey-text hover:text-proph-white transition-colors py-2"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export const LandingPage2: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'players' | 'coaches'>('players');
  const [playerCount, setPlayerCount] = useState(1247);
  const playerParam = searchParams.get('player');
  
  // Redirect coaches to their home page
  useEffect(() => {
    if (user && user.role === 'coach') {
      navigate('/coach/home', { replace: true });
    }
  }, [user, navigate]);

  // Live player counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerCount(prev => prev + 1);
    }, 8000); // Increment every 8 seconds
    return () => clearInterval(interval);
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

      {/* 2. HERO SECTION - Interactive Qualification Quiz */}
      <section className="bg-proph-yellow text-proph-black min-h-[85vh] flex flex-col justify-center py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Hero Headline */}
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-4">
            Stop Guessing.<br />Start Getting Recruited.
          </h2>
          <p className="text-xl md:text-2xl font-semibold text-proph-black/80 max-w-2xl mx-auto mb-8">
            The only platform that tells you exactly which programs you're qualified for.
          </p>

          {/* Interactive Quiz */}
          <QuickEvalQuiz />

          {/* Live Player Counter */}
          <p className="mt-6 text-sm font-semibold text-proph-black/70">
            Join <span className="inline-block min-w-[60px] text-center font-black text-proph-black transition-all duration-500">
              {playerCount.toLocaleString()}
            </span> players already committed
          </p>
        </div>
      </section>

      {/* 3. HOW IT WORKS - Tabbed Section */}
      <section className="bg-proph-grey py-20">
        <div className="max-w-6xl mx-auto px-4">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-proph-yellow flex items-center justify-center">
                  <User className="w-8 h-8 text-proph-black" />
                </div>
                <h4 className="text-xl font-bold mb-2">Create Your Profile</h4>
                <p className="text-sm text-proph-grey-text">
                  Add your stats, highlights, and academic info. Our AI evaluates your level (D1, D2, D3, NAIA) in seconds.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-proph-yellow flex items-center justify-center">
                  <Target className="w-8 h-8 text-proph-black" />
                </div>
                <h4 className="text-xl font-bold mb-2">Apply to Programs</h4>
                <p className="text-sm text-proph-grey-text">
                  Browse postings from 1,900+ college programs. See which schools match your skill level and playing style.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-proph-yellow flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-proph-black" />
                </div>
                <h4 className="text-xl font-bold mb-2">Connect Directly</h4>
                <p className="text-sm text-proph-grey-text">
                  Accepted coaches message you directly. No middlemen, no guessing games.
                </p>
              </div>
            </div>
          )}

          {/* Coaches Tab Content */}
          {activeTab === 'coaches' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-proph-yellow flex items-center justify-center">
                  <Megaphone className="w-8 h-8 text-proph-black" />
                </div>
                <h4 className="text-xl font-bold mb-2">Post Your Opening</h4>
                <p className="text-sm text-proph-grey-text">
                  Create a posting in 2 minutes. Specify position, class year, and skill requirements.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-proph-yellow flex items-center justify-center">
                  <Eye className="w-8 h-8 text-proph-black" />
                </div>
                <h4 className="text-xl font-bold mb-2">Review Qualified Athletes</h4>
                <p className="text-sm text-proph-grey-text">
                  Our AI pre-screens applicants. Only see players who fit your system and level.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-proph-yellow flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-proph-black" />
                </div>
                <h4 className="text-xl font-bold mb-2">Recruit Top Talent</h4>
                <p className="text-sm text-proph-grey-text">
                  Message players directly. Track conversations. Build your roster faster.
                </p>
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

      {/* 5. BUILT FOR THE 95% - Social Proof */}
      <section className="bg-proph-grey py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-4xl md:text-5xl font-black text-center mb-12">Built for the 95%</h3>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-proph-black rounded-2xl p-8 text-center border border-proph-grey-text/20">
              <div className="text-6xl font-black text-proph-yellow">970K</div>
              <div className="mt-2 text-base text-proph-grey-text">High school players</div>
            </div>
            <div className="bg-proph-black rounded-2xl p-8 text-center border border-proph-grey-text/20">
              <div className="text-6xl font-black text-proph-yellow">38K</div>
              <div className="mt-2 text-base text-proph-grey-text">College spots</div>
            </div>
            <div className="bg-proph-black rounded-2xl p-8 text-center border border-proph-grey-text/20">
              <div className="text-6xl font-black text-proph-yellow">95%</div>
              <div className="mt-2 text-base text-proph-grey-text">Underserved by current platforms</div>
            </div>
          </div>

          {/* Proof Points */}
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-start gap-3 text-base">
              <Check className="w-5 h-5 text-proph-yellow flex-shrink-0 mt-0.5" />
              <span className="font-semibold">Free to create your profile. Premium features start at $8/month.</span>
            </div>
            <div className="flex items-start gap-3 text-base">
              <Check className="w-5 h-5 text-proph-yellow flex-shrink-0 mt-0.5" />
              <span className="font-semibold">See exactly which coaches viewed your profile (no black box).</span>
            </div>
            <div className="flex items-start gap-3 text-base">
              <Check className="w-5 h-5 text-proph-yellow flex-shrink-0 mt-0.5" />
              <span className="font-semibold">AI evaluation based on 10,000+ real player profiles—not guesswork.</span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-12 py-4 rounded-xl bg-proph-yellow text-proph-black font-black text-lg hover:bg-proph-yellow/90 active:scale-95 transition-all shadow-lg shadow-proph-yellow/20"
            >
              Get Your Free Evaluation
            </button>
            <p className="mt-4 text-sm text-proph-grey-text">
              No credit card required. See your projected level in 60 seconds.
            </p>
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


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { verifyEmail } from '../../api/auth';

export const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const userEmail = localStorage.getItem('pendingEmail') || 'your email';

  // Check for verification token in URL (when user clicks email link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      // Call verifyEmail API which will return updated user object with account_status
      verifyEmail(token)
        .then(() => {
          // After verification, backend should return updated user object
          // Refresh user from localStorage (updated by backend response)
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              const accountStatus = user.account_status || user.accountStatus;
              const accountType = user.account_type || user.accountType;
              
              // Redirect based on account_status and account_type
              if (accountStatus === 'inactive') {
                if (accountType === 'coach') {
                  navigate('/onboarding/coach');
                } else if (accountType === 'player') {
                  navigate('/onboarding/player');
                }
              } else {
                // If active, redirect to appropriate home
                if (accountType === 'coach') {
                  navigate('/coach/home');
                } else if (accountType === 'player') {
                  navigate('/player/home');
                } else {
                  navigate('/');
                }
              }
            } catch (error) {
              console.error('Failed to parse user:', error);
              navigate('/login');
            }
          } else {
            navigate('/login');
          }
        })
        .catch((error) => {
          console.error('Email verification failed:', error);
          // Still navigate to login on error
          navigate('/login');
        });
    }
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    
    // Mock API call
    try {
      // POST /api/auth/resend-verification-email
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Verification email resent');
    } catch (error) {
      console.error('Failed to resend email:', error);
    }
  };

  return (
    <div className="min-h-screen bg-proph-black">
      <Header />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] px-4 py-8">
        <div className="max-w-md w-full bg-proph-grey rounded-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 
              className="text-proph-yellow text-3xl font-black"
              style={{ 
                textShadow: '0 0 10px rgba(255, 236, 60, 0.5)',
                letterSpacing: '-2px'
              }}
            >
              Proph
            </h1>
          </div>

          {/* Icon */}
          <div className="text-center mb-4">
            <span className="text-6xl">📧</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-proph-white text-center mb-3">
            Verify Your Email
          </h2>

          {/* Content */}
          <div className="text-center mb-6">
            <p className="text-proph-grey-text text-sm mb-2">
              We sent a verification link to:
            </p>
            <p className="text-proph-yellow font-semibold block text-center mb-4">
              {userEmail}
            </p>
            <p className="text-proph-grey-text text-sm">
              Click the link in your email to continue building your profile.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3 mt-6">
            <button
              onClick={handleResend}
              disabled={!canResend}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                canResend
                  ? 'bg-proph-grey-light text-proph-white hover:bg-proph-grey-light/80'
                  : 'bg-proph-grey-light/50 text-proph-grey-text cursor-not-allowed'
              }`}
            >
              {countdown > 0 ? `Resend available in ${countdown}s` : 'Resend Email'}
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="w-full text-proph-grey-text hover:text-proph-white text-center transition-colors"
            >
              Change Email
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-proph-yellow/10 border border-proph-yellow rounded-lg p-3 mt-6">
            <p className="text-proph-white text-sm">
              💡 Using a .edu email? You'll get instant verification!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


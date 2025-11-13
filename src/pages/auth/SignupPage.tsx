import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { validateEmail, validatePassword, validateConfirmPassword } from '../../utils/validation';
import { Header } from '../../components/layout/Header';
import { shouldRequireEmailVerification } from '../../config/features';
import { useAuth } from '../../context/authContext';

type Role = 'player' | 'coach' | 'supporter' | null;

interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  showPassword: boolean;
  showConfirmPassword: boolean;
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
    form?: string;
  };
  loading: boolean;
}

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, login } = useAuth();
  const [form, setForm] = useState<SignupForm>({
    email: '',
    password: '',
    confirmPassword: '',
    role: null,
    showPassword: false,
    showConfirmPassword: false,
    errors: {},
    loading: false,
  });

  // Pre-fill from quiz data if available
  useEffect(() => {
    const quizDataStr = localStorage.getItem('quizData');
    if (quizDataStr) {
      try {
        const quizData = JSON.parse(quizDataStr);
        // Pre-fill email and auto-select player role
        setForm(prev => ({
          ...prev,
          email: quizData.email || '',
          role: 'player' as Role
        }));
      } catch (error) {
        console.error('Error parsing quiz data:', error);
      }
    }
  }, []);

  const handleEmailBlur = () => {
    const error = validateEmail(form.email);
    setForm(prev => ({ ...prev, errors: { ...prev.errors, email: error || undefined } }));
  };

  const handlePasswordBlur = () => {
    const error = validatePassword(form.password);
    setForm(prev => ({ ...prev, errors: { ...prev.errors, password: error || undefined } }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setForm(prev => ({ ...prev, confirmPassword: value }));
    // Real-time validation if user has typed in this field
    if (value.length > 0) {
      const error = validateConfirmPassword(form.password, value);
      setForm(prev => ({ ...prev, errors: { ...prev.errors, confirmPassword: error || undefined } }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const confirmError = validateConfirmPassword(form.password, form.confirmPassword);
    const roleError = !form.role ? 'Please select your role' : null;

    if (emailError || passwordError || confirmError || roleError) {
      setForm(prev => ({
        ...prev,
        errors: {
          email: emailError || undefined,
          password: passwordError || undefined,
          confirmPassword: confirmError || undefined,
          role: roleError || undefined,
        },
      }));
      return;
    }

    setForm(prev => ({ ...prev, loading: true, errors: {} }));

    try {
      // Call real signup API (this will store token/user if account is verified)
      await signup(form.email, form.password, form.role!);
      
      // Store pending data for onboarding (needed for profile creation)
      localStorage.setItem('pendingEmail', form.email);
      localStorage.setItem('pendingPassword', form.password); // Need for auto-login after onboarding
      localStorage.setItem('pendingRole', form.role!);
      
      // Small delay to ensure auth context is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to onboarding
      switch (form.role) {
        case 'player':
          navigate('/onboarding/player');
          break;
        case 'coach':
          if (shouldRequireEmailVerification()) {
            navigate('/verify-email');
          } else {
            navigate('/onboarding/coach');
          }
          break;
        case 'supporter':
          // Supporters don't need onboarding - auto-login
          await login(form.email, form.password);
          navigate('/supporter/home');
          break;
      }
    } catch (error: any) {
      setForm(prev => ({
        ...prev,
        errors: {
          form: error.message || 'Unable to create account. Please try again.',
        },
        loading: false,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-proph-black">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-2 max-w-md">
        {/* Page Title */}
        <div className="mb-2 flex justify-center">
          <p className="text-sm text-proph-yellow text-center">Join Proph</p>
        </div>

        {/* Form Container with Grey Background */}
        <div className="bg-proph-grey rounded-2xl p-3">
          <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Form-level error */}
          {form.errors.form && (
            <div
              className="bg-proph-error/10 border border-proph-error rounded-lg p-2.5 mb-2.5 flex items-start gap-2"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-proph-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-proph-error flex-1">{form.errors.form}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-proph-white font-semibold text-sm mb-0.5"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              onBlur={handleEmailBlur}
              placeholder="Enter your email"
              className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
            />
            {form.errors.email && (
              <p className="text-proph-error text-sm mt-0.5" role="alert">
                {form.errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-proph-white font-semibold text-sm mb-0.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={form.showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                onBlur={handlePasswordBlur}
                placeholder="Create a password"
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 pr-10 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
              />
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-proph-grey-text hover:text-proph-white cursor-pointer text-sm transition-colors"
              >
                {form.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {form.errors.password ? (
              <p className="text-proph-error text-sm mt-0.5" role="alert">
                {form.errors.password}
              </p>
            ) : (
              <p className="text-proph-grey-text text-xs mt-0.5">Must be at least 8 characters</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-proph-white font-semibold text-sm mb-0.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={form.showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="Confirm your password"
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 pr-10 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
              />
              <button
                type="button"
                onClick={() =>
                  setForm(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-proph-grey-text hover:text-proph-white cursor-pointer text-sm transition-colors"
              >
                {form.showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {form.errors.confirmPassword && (
              <p className="text-proph-error text-sm mt-0.5" role="alert">
                {form.errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-proph-white font-semibold text-base mb-1">
              I am a...
            </label>
            <div className="space-y-1.5">
              {/* Player */}
              <label
                className={`block border rounded-xl p-2.5 cursor-pointer transition-all ${
                  form.role === 'player'
                    ? 'border-proph-yellow bg-proph-yellow/10'
                    : 'border-proph-grey-text/20 bg-proph-black hover:border-proph-yellow/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-base font-bold text-proph-white">Player</p>
                    <p className="text-sm text-proph-grey-text mt-1">
                      Get your Proph and get noticed
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="player"
                    checked={form.role === 'player'}
                    onChange={() => setForm(prev => ({ ...prev, role: 'player', errors: { ...prev.errors, role: undefined } }))}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 ${
                      form.role === 'player'
                        ? 'border-proph-yellow bg-proph-yellow'
                        : 'border-proph-grey-text bg-transparent'
                    }`}
                  >
                    {form.role === 'player' && (
                      <div className="w-2 h-2 rounded-full bg-proph-black" />
                    )}
                  </div>
                </div>
              </label>

              {/* Coach */}
              <label
                className={`block border rounded-xl p-2.5 cursor-pointer transition-all ${
                  form.role === 'coach'
                    ? 'border-proph-yellow bg-proph-yellow/10'
                    : 'border-proph-grey-text/20 bg-proph-black hover:border-proph-yellow/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-base font-bold text-proph-white">Coach</p>
                    <p className="text-sm text-proph-grey-text mt-1">
                      Find the perfect fit for your team
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="coach"
                    checked={form.role === 'coach'}
                    onChange={() => setForm(prev => ({ ...prev, role: 'coach', errors: { ...prev.errors, role: undefined } }))}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 ${
                      form.role === 'coach'
                        ? 'border-proph-yellow bg-proph-yellow'
                        : 'border-proph-grey-text bg-transparent'
                    }`}
                  >
                    {form.role === 'coach' && (
                      <div className="w-2 h-2 rounded-full bg-proph-black" />
                    )}
                  </div>
                </div>
              </label>

              {/* Supporter */}
              <label
                className={`block border rounded-xl p-2.5 cursor-pointer transition-all ${
                  form.role === 'supporter'
                    ? 'border-proph-yellow bg-proph-yellow/10'
                    : 'border-proph-grey-text/20 bg-proph-black hover:border-proph-yellow/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-base font-bold text-proph-white">Supporter</p>
                    <p className="text-sm text-proph-grey-text mt-1">
                      Follow players, explore talent, and support the next generation
                    </p>
                    <p className="text-xs text-proph-grey-text/70 mt-1.5 italic">
                      For parents, fans, high school coaches, and scouts
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="supporter"
                    checked={form.role === 'supporter'}
                    onChange={() => setForm(prev => ({ ...prev, role: 'supporter', errors: { ...prev.errors, role: undefined } }))}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 ${
                      form.role === 'supporter'
                        ? 'border-proph-yellow bg-proph-yellow'
                        : 'border-proph-grey-text bg-transparent'
                    }`}
                  >
                    {form.role === 'supporter' && (
                      <div className="w-2 h-2 rounded-full bg-proph-black" />
                    )}
                  </div>
                </div>
              </label>
            </div>
            {form.errors.role && (
              <p className="text-proph-error text-sm mt-0.5" role="alert">
                {form.errors.role}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              form.loading ||
              !form.email ||
              !form.password ||
              !form.confirmPassword ||
              !form.role ||
              !!form.errors.email ||
              !!form.errors.password ||
              !!form.errors.confirmPassword ||
              !!form.errors.role
            }
            className={`w-full bg-proph-yellow text-proph-black font-black py-2.5 rounded-xl text-lg mt-2.5 transition-all ${
              form.loading ||
              !form.email ||
              !form.password ||
              !form.confirmPassword ||
              !form.role ||
              !!form.errors.email ||
              !!form.errors.password ||
              !!form.errors.confirmPassword ||
              !!form.errors.role
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-[#E6D436] active:scale-[0.98]'
            }`}
          >
            {form.loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Sign In Link */}
          <div className="text-center mt-2.5">
            <p className="text-proph-grey-text text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-proph-yellow hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
        </div>
      </main>
    </div>
  );
};


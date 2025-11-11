import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { validateEmail, validatePassword } from '../../utils/validation';
import { Header } from '../../components/layout/Header';
import { useAuth } from '../../context/authContext';
import { useNotification } from '../../hooks';

interface LoginForm {
  email: string;
  password: string;
  showPassword: boolean;
  errors: {
    email?: string;
    password?: string;
    form?: string;
  };
  loading: boolean;
}

// Mock API function for testing (matches authService.login format)
const mockLogin = (email: string, password: string): Promise<{ user: any; token: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock users for testing
      const mockUsers: Record<string, { password: string; role: string; id: number }> = {
        'player@test.com': { password: 'password123', role: 'player', id: 1 },
        'coach@test.com': { password: 'password123', role: 'coach', id: 2 },
        'supporter@test.com': { password: 'password123', role: 'fan', id: 3 },
      };

      const user = mockUsers[email];
      if (!user || user.password !== password) {
        reject(new Error('Invalid email or password.'));
        return;
      }

      // Success - format matches backend response
      resolve({
        user: {
          id: user.id,
          email,
          account_type: user.role,
          email_verified: true,
        },
        token: `mock-token-${Date.now()}`,
      });
    }, 1000);
  });
};

// Check if we should use mock API (for testing/development)
const shouldUseMockAPI = (): boolean => {
  // Use mock if API URL is not set or if explicitly enabled
  return !import.meta.env.VITE_API_URL || localStorage.getItem('useMockAuth') === 'true';
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const redirectTo = searchParams.get('redirect') || null;

  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
    showPassword: false,
    errors: {},
    loading: false,
  });

  const handleEmailBlur = () => {
    const error = validateEmail(form.email);
    setForm(prev => ({ ...prev, errors: { ...prev.errors, email: error || undefined } }));
  };

  const handlePasswordBlur = () => {
    const error = validatePassword(form.password);
    setForm(prev => ({ ...prev, errors: { ...prev.errors, password: error || undefined } }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);

    if (emailError || passwordError) {
      setForm(prev => ({
        ...prev,
        errors: {
          email: emailError || undefined,
          password: passwordError || undefined,
        },
      }));
      return;
    }

    setForm(prev => ({ ...prev, loading: true, errors: {} }));

    try {
      let userRole = 'player';
      
      if (shouldUseMockAPI()) {
        // Use mock API for testing
        const response = await mockLogin(form.email, form.password);
        
        // Store auth token and user data (matching backend format)
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Extract role for redirect
        const accountType = response.user.account_type;
        userRole = accountType === 'fan' ? 'supporter' : accountType || 'player';
        
        // Navigate - auth context will pick up user from localStorage on next page
        // We'll navigate below after this if/else block
      } else {
        // Use real API (handles localStorage and context updates)
        await login(form.email, form.password);
        
        // Clean up any pending onboarding data (security: remove password from localStorage)
        localStorage.removeItem('pendingEmail');
        localStorage.removeItem('pendingPassword');
        localStorage.removeItem('pendingRole');
        
        // Get role from stored user
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            const accountType = user.account_type;
            userRole = accountType === 'fan' ? 'supporter' : accountType || 'player';
          } catch (error) {
            console.error('Failed to parse user:', error);
          }
        }
      }


      // Redirect based on redirect param or role
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        switch (userRole) {
          case 'player':
            navigate('/player/home');
            break;
          case 'coach':
            navigate('/coach/home');
            break;
          case 'supporter':
          case 'fan':
            navigate('/supporter/home');
            break;
          default:
            navigate('/player/home');
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid email or password. Please try again.';
      setForm(prev => ({
        ...prev,
        errors: {
          form: errorMessage,
        },
        loading: false,
      }));
      // Show error notification
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-proph-black">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-2 max-w-md">
        {/* Page Title */}
        <div className="mb-2 flex justify-center">
          <p className="text-sm text-proph-yellow text-center">Sign in to your account</p>
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
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value, errors: { ...prev.errors, email: undefined } }))}
                onBlur={handleEmailBlur}
                placeholder="Enter your email"
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                autoComplete="email"
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
                  onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value, errors: { ...prev.errors, password: undefined } }))}
                  onBlur={handlePasswordBlur}
                  placeholder="Enter your password"
                  className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 pr-10 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-proph-grey-text hover:text-proph-white cursor-pointer text-sm transition-colors"
                  aria-label={form.showPassword ? 'Hide password' : 'Show password'}
                >
                  {form.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.errors.password && (
                <p className="text-proph-error text-sm mt-0.5" role="alert">
                  {form.errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-proph-yellow hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                form.loading ||
                !form.email ||
                !form.password ||
                !!form.errors.email ||
                !!form.errors.password
              }
              className={`w-full bg-proph-yellow text-proph-black font-black py-2.5 rounded-xl text-lg mt-2.5 transition-all ${
                form.loading ||
                !form.email ||
                !form.password ||
                !!form.errors.email ||
                !!form.errors.password
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-[#E6D436] active:scale-[0.98]'
              }`}
            >
              {form.loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center mt-2.5">
              <p className="text-proph-grey-text text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-proph-yellow hover:underline">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Test Credentials (only show in development/mock mode) */}
        {shouldUseMockAPI() && (
          <div className="mt-4 p-3 bg-proph-grey/50 rounded-lg border border-proph-grey-text/20">
            <p className="text-xs text-proph-grey-text mb-2 font-semibold">Test Credentials:</p>
            <div className="space-y-1 text-xs text-proph-grey-text">
              <p>Player: player@test.com / password123</p>
              <p>Coach: coach@test.com / password123</p>
              <p>Supporter: supporter@test.com / password123</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};


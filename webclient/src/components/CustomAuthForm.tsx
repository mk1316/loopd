'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { posthog } from '@/lib/posthog';

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function AuthUnavailable() {
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="card-dark border-white/20 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/20 border border-yellow-500/30">
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">
              Authentication Unavailable
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              Authentication services are currently unavailable. Please try again later or download the desktop app.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

function CustomAuthFormInner() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check URL parameters for mode
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup') {
      setMode('sign-up');
    }
  }, [searchParams]);

  // Real-time validation
  useEffect(() => {
    const errors: ValidationErrors = {};

    // Email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (password) {
      if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        errors.password = 'Password must contain uppercase, lowercase, and number';
      }
    }

    // Confirm password validation (only for sign-up)
    if (mode === 'sign-up' && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
  }, [email, password, confirmPassword, mode]);

  // If Supabase is not available, show a message
  if (!supabase) {
    return <AuthUnavailable />;
  }

  const handleModeToggle = () => {
    setIsTransitioning(true);
    setError('');
    setSuccess('');
    setValidationErrors({});
    setEmail('');
    setPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
      setIsTransitioning(false);
    }, 150);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      setError('Please fix the validation errors above');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'sign-in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          posthog?.capture('login_error', {
            error_message: error.message,
            method: 'email_password'
          });
          setError(getErrorMessage(error.message));
        } else {
          posthog?.capture('login_success', {
            method: 'email_password'
          });
          setSuccess('Signed in successfully!');
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
            data: {
              app_name: 'Loopd Digital Wellness',
            }
          }
        });
        if (error) {
          posthog?.capture('signup_error', {
            error_message: error.message,
            method: 'email_password'
          });
          setError(getErrorMessage(error.message));
        } else {
          posthog?.capture('signup_success', {
            method: 'email_password'
          });
          setSuccess('Check your email to verify your account!');
        }
      }
    } catch (err) {
      posthog?.capture('error_occurred', {
        error_type: 'authentication_exception',
        error_message: err instanceof Error ? err.message : 'Unknown error',
        method: mode === 'sign-in' ? 'email_password_login' : 'email_password_signup'
      });
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        posthog?.capture('login_error', {
          error_message: error.message,
          method: `oauth_${provider}`
        });
        setError(getErrorMessage(error.message));
      } else {
        posthog?.capture('login_success', {
          method: `oauth_${provider}`
        });
      }
    } catch (err) {
      posthog?.capture('error_occurred', {
        error_type: 'social_login_exception',
        error_message: err instanceof Error ? err.message : 'Unknown error',
        method: `oauth_${provider}`
      });
      setError('Social login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (message: string): string => {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password. Please check your credentials.',
      'Email not confirmed': 'Please check your email and click the verification link.',
      'User already registered': 'An account with this email already exists. Try signing in instead.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
      'Unable to validate email address: invalid format': 'Please enter a valid email address.'
    };

    return errorMap[message] || message;
  };

  const isFormValid = Object.keys(validationErrors).length === 0 &&
                     email &&
                     password &&
                     (mode === 'sign-in' || (mode === 'sign-up' && confirmPassword));

  return (
    <div className={`w-full max-w-md mx-auto transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
      <Card className="card-dark border-white/20 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-button animate-glow">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white transition-all duration-300">
              {mode === 'sign-in' ? 'Welcome back' : 'Create account'}
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2 transition-all duration-300">
              {mode === 'sign-in'
                ? 'Sign in to your Loopd account'
                : 'Start tracking your app usage'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20" role="alert">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20" role="alert">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Social Login Buttons - moved above form */}
          <div className="space-y-3">
            <p className="text-center text-gray-500 text-sm">Continue with</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="flex-1 min-w-0 h-14 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-white/10 flex items-center justify-center text-white text-lg font-semibold"
                aria-label="Sign in with Google"
              >
                <svg className="w-7 h-7 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                onClick={() => handleSocialLogin('apple')}
                disabled={loading}
                className="flex-1 min-w-0 h-14 rounded-xl bg-black/20 hover:bg-black/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-white/10 flex items-center justify-center text-white text-lg font-semibold"
                aria-label="Sign in with Apple"
              >
                <svg className="w-7 h-7 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-white/10" />
            <span className="mx-3 text-gray-500 text-xs">or sign in with email</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  className={`w-full pl-10 bg-white/5 text-white border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-gray-400 text-base ${
                    validationErrors.email
                      ? 'border-red-500/50 focus:border-red-500/50'
                      : 'border-white/10 focus:border-blue-500/50'
                  }`}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                  aria-invalid={!!validationErrors.email}
                />
              </div>
              {validationErrors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-400" role="alert">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className={`w-full pl-10 pr-10 bg-white/5 text-white border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-gray-400 text-base ${
                    validationErrors.password
                      ? 'border-red-500/50 focus:border-red-500/50'
                      : 'border-white/10 focus:border-blue-500/50'
                  }`}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  aria-describedby={validationErrors.password ? 'password-error' : undefined}
                  aria-invalid={!!validationErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {validationErrors.password && (
                <p id="password-error" className="mt-2 text-sm text-red-400" role="alert">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {mode === 'sign-up' && (
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    className={`w-full pl-10 pr-10 bg-white/5 text-white border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-gray-400 text-base ${
                      validationErrors.confirmPassword
                        ? 'border-red-500/50 focus:border-red-500/50'
                        : 'border-white/10 focus:border-blue-500/50'
                    }`}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    aria-describedby={validationErrors.confirmPassword ? 'confirm-password-error' : undefined}
                    aria-invalid={!!validationErrors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p id="confirm-password-error" className="mt-2 text-sm text-red-400" role="alert">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full gradient-button hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg text-base"
              aria-describedby={loading ? 'loading-description' : undefined}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span id="loading-description" className="sr-only">Loading...</span>
                  {mode === 'sign-in' ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                mode === 'sign-in' ? 'Sign in' : 'Create account'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleModeToggle}
                className="text-sm text-gray-400 hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded font-medium"
                disabled={isTransitioning}
              >
                {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomAuthForm() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md mx-auto">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
              <div className="h-10 bg-gray-600 rounded mb-4"></div>
              <div className="h-10 bg-gray-600 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <CustomAuthFormInner />
    </Suspense>
  );
}

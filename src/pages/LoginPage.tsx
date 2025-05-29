import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/cardSC';
import { Button } from '@/components/ui/buttonSC';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Sparkles, Zap } from 'lucide-react';
import { GoMail } from 'react-icons/go';

// Declare global google variable
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Load Google Identity Services
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) {
        setGoogleLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleLoaded(true);
      };
      script.onerror = () => {
        setError('Failed to load Google Sign-In. Please refresh and try again.');
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  // Initialize Google Sign-In when loaded
  useEffect(() => {
    if (googleLoaded && window.google) {
      window.google.accounts.id.initialize({
        client_id: '888884451068-qj86re7vb9m9kp9a0s6d5oh4pmj256mk.apps.googleusercontent.com',
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the button
      const buttonElement = document.getElementById('google-signin-button');
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
        });
      }
    }
  }, [googleLoaded]);

  // Handle Google OAuth response
  const handleGoogleResponse = async (response: any) => {
    if (!response.credential) {
      setError('No credential received from Google');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await loginWithGoogle(response.credential);
      // Navigation will be handled by the useEffect above
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback manual login trigger
  const handleManualGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-black-50 to-grey-100 dark:from-black  dark:to-black-800 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="relative w-full max-w-md">
        {/* Main Login Card */}
        <Card className="backdrop-blur-sm bg-white/95 dark:bg-black dark:border-primary/20 dark:bg-gradient-to-r dark:from-primary/5 dark:to-primary/10 border-0 shadow-2xl shadow-blue-500/10">
          <CardHeader className="text-center space-y-4 pb-8">
            {/* Logo/Brand Area */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Welcome back
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
                Sign in to continue to your account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Google Sign-In Section */}
            <div className="space-y-4">
              {googleLoaded ? (
                <div className="space-y-3">
                  {/* Custom Google Button Wrapper */}
                  <div className="relative">
                    <div id="google-signin-button" className="w-full [&>div]:!w-full [&>div>div]:!w-full" />
                    
                    {/* Fallback Custom Button */}
                    
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-8">
                  <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Loading authentication...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Coming Soon Section */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black-200 dark:border-black-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-transparent px-3 text-grey-500 dark:text-grey-400 font-medium">
                  More options coming soon
                </span>
              </div>
            </div>

            {/* Future Auth Methods Preview */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <Button
                    variant="outline"
                    className="w-full h-12 opacity-50 cursor-not-allowed border-dashed"
                    disabled
                  >
                    <GoMail/>
                    Email
                  </Button>
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-xs">
                    Soon
                  </Badge>
                </div>
                
                <div className="relative group">
                  <Button
                    variant="outline"
                    className="w-full h-12 opacity-50 cursor-not-allowed border-dashed"
                    disabled
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 2.94-.64 5.32-1.41 5.32-.78 0-1.41-2.38-1.41-5.32s.63-5.32 1.41-5.32S24 9.06 24 12z"/>
                    </svg>
                    SSO
                  </Button>
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-xs">
                    Soon
                  </Badge>
                </div>
              </div>
              
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                We're adding more authentication methods
                <Zap className="w-3 h-3" />
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Privacy */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

import {
  Loader as Loader2,
  GraduationCap,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const {
    signIn,
    user,
    role,
    isLoading: authLoading,
  } = useAuth();

  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /*
   * Redirect authenticated users based on their role.
   *
   * IMPORTANT:
   * We do NOT check is_approved here.
   *
   * Both pending and approved students are allowed
   * to enter the student dashboard.
   *
   * The student dashboard will decide what features
   * are available based on profile.is_approved.
   */
  useEffect(() => {
    if (authLoading) return;

    if (!user) return;

    /*
     * The user exists but the role hasn't been loaded yet.
     *
     * Do NOT redirect to "/".
     *
     * Wait for AuthContext to finish fetching the role.
     */
    if (!role) return;

    if (role === 'admin') {
      router.replace('/admin');
      return;
    }

    if (role === 'student') {
      router.replace('/student/dashboard');
      return;
    }

    /*
     * Fallback for an unexpected role.
     */
    router.replace('/');
  }, [authLoading, user, role, router]);

  /*
   * Handle login form submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    if (!password) {
      toast({
        title: 'Password Required',
        description: 'Please enter your password.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await signIn(normalizedEmail, password);

      toast({
        title: 'Login Successful',
        description: 'Welcome back! Redirecting to your dashboard...',
      });

      /*
       * We intentionally do NOT call router.push() here.
       *
       * AuthContext will update:
       *
       * user
       * role
       *
       * and the useEffect above will redirect
       * to the correct dashboard.
       */
    } catch (error) {
      let message = 'Failed to login. Please try again.';

      if (error instanceof Error) {
        message = error.message;
      }

      /*
       * Make Supabase's email-confirmation error
       * easier for the student to understand.
       */
      const lowerMessage = message.toLowerCase();

      if (
        lowerMessage.includes('email not confirmed') ||
        lowerMessage.includes('email_not_confirmed')
      ) {
        message =
          'Please confirm your email address before logging in. Check your inbox for the confirmation email.';
      }

      toast({
        title: 'Login Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * Initial authentication loading.
   */
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

          <p className="text-sm text-gray-500">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  /*
   * User is already authenticated and role is being
   * resolved.
   *
   * Instead of displaying the login form or redirecting
   * incorrectly, show a loading state.
   */
  if (user && !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

          <p className="text-sm text-gray-500">
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  /*
   * User has a valid role.
   *
   * The useEffect above is already redirecting them.
   */
  if (user && role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

          <p className="text-sm text-gray-500">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Normal login screen.
   */
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo / Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
              <GraduationCap className="h-9 w-9 text-white" />
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Starlight Academy
          </h1>

          <p className="mt-2 text-gray-500">
            Login to your account
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-blue-100 shadow-xl shadow-blue-100/50">
          <CardHeader>
            <CardTitle className="text-blue-900">
              Login
            </CardTitle>

            <CardDescription>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  placeholder="your@email.com"
                  className="border-blue-100 focus:border-blue-400 focus:ring-blue-400"
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password
                </Label>

                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  placeholder="••••••••"
                  className="border-blue-100 focus:border-blue-400 focus:ring-blue-400"
                  disabled={isLoading}
                />
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            {/* Signup Link */}
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-500">
                Don&apos;t have an account?{' '}

                <Link
                  href="/auth/signup"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          © 2024 Starlight Academy.
          All rights reserved.
        </p>
      </div>
    </div>
  );
}
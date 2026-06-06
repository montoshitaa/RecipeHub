/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { login as authApiLogin, normalizeUser } from '../api/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader } from '../components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // If already logged in, redirect to home immediately
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  // Read target return route for user convenience
  const fromPath = (location.state as any)?.from?.pathname || '/';

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const response = await authApiLogin(data.email, data.password);
      const backendUser = response.data.user;
      login(response.data.token, normalizeUser(backendUser));
      toast.success('Welcome back!');
      navigate(fromPath, { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid email or password.';
      setError(message);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 animate-in fade-in duration-300" id="login-page">
      <div className="w-full max-w-[400px] border border-border-custom bg-surface p-6 sm:p-8 space-y-6">
        <div className="space-y-1 text-center">
          <span className="font-serif text-2xl font-bold tracking-tight text-text-custom block">
            RecipeHub
          </span>
          <h2 className="font-serif text-base font-normal tracking-tight text-text-custom">
            Sign in to your account
          </h2>
          <div className="border-b border-border-custom my-4"></div>
        </div>

        {error && (
          <div className="bg-red-50 border border-danger text-danger p-3 font-mono text-[11px] leading-relaxed select-none">
            <p className="font-bold uppercase tracking-wider mb-1">AUTH EXCEPTION</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-mono text-text-custom mb-2 font-bold">
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="you@domain.com"
              className="w-full bg-[#fcfcfc] border border-border-custom p-3.5 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm"
            />
            {errors.email && (
              <p className="text-danger text-[11px] font-mono mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-mono text-text-custom mb-2 font-bold">
              Password *
            </label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full bg-[#fcfcfc] border border-border-custom p-3.5 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm"
            />
            {errors.password && (
              <p className="text-danger text-[11px] font-mono mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full border border-text-custom bg-text-custom hover:bg-white hover:text-text-custom text-white py-3.5 font-mono text-xs uppercase tracking-widest font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none translate-y-0 hover:translate-y-1"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign in'}
          </Button>
        </form>

        <div className="border-t border-border-custom pt-5 text-center">
          <p className="text-sm text-text-muted font-sans flex items-center justify-center gap-3">
            <span>Don't have an account?</span>
            <Link
              to="/register"
              className="text-text-custom hover:text-accent font-bold font-mono tracking-widest uppercase flex items-center gap-1.5 transition-colors"
            >
              <span className="border-b border-transparent hover:border-accent">REGISTER</span>
              <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

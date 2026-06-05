/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to home immediately
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  // Read target return route for user convenience
  const fromPath = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiFetch('/api/auth/login', {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      if (response && response.token && response.user) {
        login(response.token, response.user);
        navigate(fromPath, { replace: true });
      } else {
        throw new Error('Authentication response was incomplete.');
      }
    } catch (err: any) {
      console.error('Login error', err);
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 animate-fade-in" id="login-page">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-mono text-text-custom mb-2 font-bold">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
              className="w-full bg-[#fcfcfc] border border-border-custom p-3.5 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-mono text-text-custom mb-2 font-bold">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#fcfcfc] border border-border-custom p-3.5 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full border border-text-custom bg-text-custom hover:bg-white hover:text-text-custom text-white py-3.5 font-mono text-xs uppercase tracking-widest font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none translate-y-0 hover:translate-y-1"
          >
            {submitting ? 'Authenticating...' : 'Sign in'}
          </button>
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

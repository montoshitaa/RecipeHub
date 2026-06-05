/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login, token } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Initial validations
    if (!name.trim() || !email.trim() || !password) {
      setError('Full name, email, and password fields are required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
          bio: bio.trim() || undefined,
        }),
      });

      if (response && response.token && response.user) {
        login(response.token, response.user);
        navigate('/');
      } else {
        throw new Error('Registration response was incomplete.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err?.message || 'An account with this email may already exist, or registration failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 animate-fade-in" id="register-page">
      <div className="w-full max-w-[400px] border border-border-custom bg-surface p-6 sm:p-8 space-y-6">
        <div className="space-y-1 text-center">
          <span className="font-serif text-2xl font-bold tracking-tight text-text-custom block">
            RecipeHub
          </span>
          <h2 className="font-serif text-base font-normal tracking-tight text-text-custom">
            Create your account
          </h2>
          <div className="border-b border-border-custom my-4"></div>
        </div>

        {error && (
          <div className="bg-red-50 border border-danger text-danger p-3 font-mono text-[11px] leading-relaxed select-none">
            <p className="font-bold uppercase tracking-wider mb-1">REGISTRATION EXCEPTION</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-mono text-text-custom mb-2 font-bold">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alice Green"
              required
              className="w-full bg-[#fcfcfc] border border-border-custom p-3.5 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm"
            />
          </div>

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
              Password * (min 8 chars)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full bg-[#fcfcfc] border border-border-custom p-3.5 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-mono text-text-custom mb-2 font-bold">
              Short Chef Bio (Optional)
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell readers slightly about yourself or your favorite recipes..."
              className="w-full bg-[#fcfcfc] border border-border-custom p-3.5 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full border border-text-custom bg-text-custom hover:bg-white hover:text-text-custom text-white py-3.5 font-mono text-xs uppercase tracking-widest font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none translate-y-0 hover:translate-y-1"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="border-t border-border-custom pt-5 text-center">
          <p className="text-sm text-text-muted font-sans flex items-center justify-center gap-3">
            <span>Already have an account?</span>
            <Link
              to="/login"
              className="text-text-custom hover:text-accent font-bold font-mono tracking-widest uppercase flex items-center gap-1.5 transition-colors"
            >
              <span className="border-b border-transparent hover:border-accent">SIGN IN</span>
              <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

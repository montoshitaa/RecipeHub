/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const activeStyle = "border-b-2 border-text-custom text-text-custom font-bold px-1 py-1.5 text-sm font-mono uppercase tracking-wider transition-colors";
  const inactiveStyle = "border-b-2 border-transparent text-text-muted hover:text-text-custom hover:border-border-custom px-1 py-1.5 text-sm font-mono uppercase tracking-wider transition-colors";

  return (
    <header className="border-b border-border-custom bg-surface w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-0 sm:h-18 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
        {/* Brand Logo */}
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-text-custom hover:text-accent transition-colors">
          RecipeHub
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 sm:gap-x-8">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
          >
            Home
          </NavLink>

          {token ? (
            <>
              <NavLink
                to="/create"
                className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
              >
                New Recipe
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
              >
                My Profile
              </NavLink>
              <div className="hidden sm:flex items-center gap-2 border-l border-border-custom pl-6 mr-2 h-6 select-none text-xs text-text-muted font-mono leading-none">
                Hello, <span className="font-bold text-text-custom">{user?.name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="btn-secondary border border-border-custom text-text-custom hover:bg-text-custom hover:text-white font-mono text-[11px] uppercase tracking-wider px-4 py-2.5 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="border border-text-custom bg-text-custom hover:bg-white hover:text-text-custom text-white font-mono text-[11px] uppercase tracking-wider px-4 py-2.5 transition-colors cursor-pointer"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

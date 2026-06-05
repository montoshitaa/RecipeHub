/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { Toaster } from 'sonner';

// Pages (Phase 1 scope)
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { NotFound } from './pages/NotFound';
import { Home } from './pages/Home';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-bg flex flex-col justify-between selection:bg-accent selection:text-white" id="recipehub-root">
          <div className="flex-grow">
            {/* Nav Header */}
            <Header />

            <Toaster />

            {/* Main Application Container */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* 404 Catch All */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>

          {/* Minimalist Editorial Footer */}
          <footer className="border-t border-border-custom bg-surface py-8 font-mono text-[11px] text-text-muted mt-16 select-none relative w-full overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 text-center md:text-left">
              <div className="flex flex-col gap-1">
                <p className="font-bold text-text-custom tracking-widest uppercase">&copy; 2026 RECIPEHUB COOPERATIVE CORPORATION</p>
                <p className="text-[10px] uppercase opacity-80">ALL RIGHTS RESERVED IN ALL JURISDICTIONS.</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] tracking-widest font-bold uppercase">
                <span className="hover:text-text-custom cursor-pointer transition-colors border-b border-transparent hover:border-text-custom pb-0.5">TERMS: SHARP &amp; FLAT</span>
                <span className="text-border-custom">|</span>
                <span className="opacity-70">SYSTEM VERSION: 1.0.0</span>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

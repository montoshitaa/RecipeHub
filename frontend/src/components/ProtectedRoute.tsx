/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12 animate-pulse">
        <div className="text-center border border-border-custom bg-surface p-12 max-w-sm w-full flex flex-col items-center gap-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="w-10 h-10 border-[3px] border-neutral-200 border-t-text-custom rounded-full animate-spin"></div>
          <div className="font-mono tracking-widest text-text-custom text-[11px] font-bold uppercase mt-2">
            Verifying Session...
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    // Redirect to /login but preserve the previous path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

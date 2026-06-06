/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '@/components/ui/spinner';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <div className="border border-border-custom bg-surface p-12 max-w-sm w-full flex flex-col items-center gap-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
          <Spinner className="size-10 text-text-custom" />
          <div className="font-mono tracking-widest text-text-custom text-[11px] font-bold uppercase">
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

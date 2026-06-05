import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Unauthorized: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in" id="unauthorized-page">
      <div className="border border-danger/30 bg-[#fff5f5] p-10 sm:p-16 max-w-2xl w-full text-center space-y-6 relative overflow-hidden">
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white border border-danger/50 flex items-center justify-center mb-6 text-danger shadow-sm">
            <ShieldAlert size={32} />
          </div>
          
          <h1 className="font-serif text-5xl sm:text-6xl font-bold tracking-tight text-danger mb-2">
            403
          </h1>
          <h2 className="font-mono text-sm sm:text-base font-bold uppercase tracking-widest text-[#c0392b] mb-6">
            Access Forbidden
          </h2>
          
          <p className="text-[#922b21] font-sans leading-relaxed max-w-md mx-auto mb-8">
            You do not have the required credentials to access or modify this resource. This action requires ownership verification or an active authenticated session.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            {token ? (
              <button
                onClick={() => navigate(-1)}
                className="btn-primary inline-flex items-center gap-3 border border-danger bg-danger hover:bg-white hover:text-danger text-white px-8 py-3.5 font-mono text-[11px] uppercase tracking-widest font-bold transition-all shadow-[4px_4px_0px_0px_rgba(231,76,60,0.2)] hover:shadow-none translate-y-0 hover:translate-y-1"
              >
                <ArrowLeft size={16} />
                Go Back
              </button>
            ) : (
              <Link
                to="/login"
                className="btn-primary inline-flex items-center gap-3 border border-text-custom bg-text-custom hover:bg-white hover:text-text-custom text-white px-8 py-3.5 font-mono text-[11px] uppercase tracking-widest font-bold transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none translate-y-0 hover:translate-y-1"
              >
                Sign In to Proceed
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

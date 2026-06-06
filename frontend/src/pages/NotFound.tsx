import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-in fade-in duration-300" id="not-found-page">
      <div className="border border-border-custom bg-surface p-10 sm:p-16 max-w-2xl w-full text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-neutral-100 border border-border-custom flex items-center justify-center mb-6 text-text-muted transform -rotate-6">
            <SearchX size={32} />
          </div>
          
          <h1 className="font-serif text-6xl sm:text-7xl font-bold tracking-tight text-text-custom mb-2">
            404
          </h1>
          <h2 className="font-mono text-sm sm:text-base font-bold uppercase tracking-widest text-text-muted mb-6">
            Sector Not Found
          </h2>
          
          <p className="text-text-custom font-sans leading-relaxed max-w-md mx-auto mb-8">
            The coordinates you provided do not correspond to any active recipe or catalog entry in our database.
          </p>
          
          <Link
            to="/"
            className="btn-primary inline-flex items-center gap-3 border border-text-custom bg-text-custom hover:bg-white hover:text-text-custom text-white px-8 py-3.5 font-mono text-[11px] uppercase tracking-widest font-bold transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none translate-y-0 hover:translate-y-1"
          >
            <ArrowLeft size={16} />
            Return to Feed
          </Link>
        </div>
      </div>
    </div>
  );
};

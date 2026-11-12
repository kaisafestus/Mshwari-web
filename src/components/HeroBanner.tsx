import React from 'react';
import { TrendingUp, Shield, Zap, Clock } from 'lucide-react';
import { ProgramConfig } from '../types';

interface HeroBannerProps {
  program: ProgramConfig;
  onSelectPackages?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ program, onSelectPackages }) => {
  return (
    <section className="relative w-full min-h-[300px] sm:min-h-[340px] flex items-center overflow-hidden bg-[#073619]">
      {/* Background Photography with Scrim */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-100"
        style={{
          backgroundImage: "url('/assets/mshw.jpg')",
          backgroundPosition: 'center 47%',
        }}
        aria-hidden="true"
      />

      {/* Measured Contrast Scrim */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#003817]/95 via-[#01471d]/85 to-[#00240e]/65" />

      {/* Decorative subtle ambient circle */}
      <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#10b32d]/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 text-left">
        <div className="max-w-2xl">
          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2 sm:mb-3 flex flex-wrap items-center gap-x-2.5">
            <span>{program.heroWords[0]}</span>
            <span className="text-[#a8f3b2]">{program.heroWords[1]}</span>
            <span className="inline-flex items-center text-[#42e46c] text-2xl sm:text-3xl animate-bounce">
              <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/90 text-base sm:text-lg md:text-xl font-medium mb-4 leading-relaxed">
            {program.subtitle}
          </p>

          {/* Quick Package Navigation Action */}
          {onSelectPackages && (
            <div className="mb-6">
              <button
                onClick={onSelectPackages}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#047514] to-[#078d1b] hover:from-[#035e10] hover:to-[#067215] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg border border-white/20 transition-all active:scale-95 cursor-pointer"
              >
                <span>Select Limit Package</span>
                <span className="text-emerald-200">↓</span>
              </button>
            </div>
          )}

          {/* Trust metric highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-white/80 text-xs sm:text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10">
              <Zap className="w-4 h-4 text-[#42e46c] shrink-0" />
              <span>Instant STK Push</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-[#42e46c] shrink-0" />
              <span>2–15 Min Refresh</span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10">
              <Shield className="w-4 h-4 text-[#42e46c] shrink-0" />
              <span>Secure 256-Bit SSL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

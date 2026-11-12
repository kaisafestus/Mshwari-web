import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { RecentTransaction } from '../types';
import { INITIAL_RECENT_FEEDS } from '../data/programs';

export const RecentTicker: React.FC = () => {
  const [feeds, setFeeds] = useState<RecentTransaction[]>(INITIAL_RECENT_FEEDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % feeds.length);
        setIsFading(false);
      }, 300);
    }, 4500);

    return () => clearInterval(timer);
  }, [feeds.length]);

  const current = feeds[currentIndex] || feeds[0];

  return (
    <div className="bg-gradient-to-r from-[#eaf9ef] to-[#e1f5e8] border border-[#c4e8d0] rounded-xl p-3 sm:p-4 mb-4 shadow-2xs">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0b4d25]">
          <TrendingUp className="w-4 h-4 text-[#078a1f]" />
          <span>Recent Limit Upgrades</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#dcfce7] text-[#16a34a] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#bbf7d0]">
          <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse-dot" />
          <span>LIVE</span>
        </div>
      </div>

      <div
        className={`text-xs sm:text-sm text-[#25523a] transition-opacity duration-300 flex items-center gap-2 font-mono-numbers ${
          isFading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className="font-semibold text-slate-800">{current.phoneMasked}</span>
        <span>increased {current.program} to</span>
        <span className="font-extrabold text-[#078a1f]">
          Ksh {current.amount.toLocaleString()}
        </span>
        <span className="text-slate-400 text-xs">· {current.timeAgo}</span>
      </div>
    </div>
  );
};

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenApply: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenApply,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ccebd7] shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single element) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xl font-extrabold tracking-tight text-[#0b4d25] flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b32d] to-[#04771b] flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <span>
            LoanBoost<span className="text-[#078a1f]">Kenya</span>
          </span>
        </a>

        {/* Zone 2: 4-5 Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#2d4d38]">
          <button
            onClick={onOpenApply}
            className={`transition-colors hover:text-[#078a1f] whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'calculator' ? 'text-[#078a1f] font-semibold underline underline-offset-8 decoration-2' : ''
            }`}
          >
            Limit Packages
          </button>
          <button
            onClick={() => setActiveTab('estimator')}
            className={`transition-colors hover:text-[#078a1f] whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'estimator' ? 'text-[#078a1f] font-semibold underline underline-offset-8 decoration-2' : ''
            }`}
          >
            Credit Estimator
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`transition-colors hover:text-[#078a1f] whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'status' ? 'text-[#078a1f] font-semibold underline underline-offset-8 decoration-2' : ''
            }`}
          >
            Track Status
          </button>
          <button
            onClick={() => setActiveTab('ussd')}
            className={`transition-colors hover:text-[#078a1f] whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'ussd' ? 'text-[#078a1f] font-semibold underline underline-offset-8 decoration-2' : ''
            }`}
          >
            USSD Codes
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`transition-colors hover:text-[#078a1f] whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'faq' ? 'text-[#078a1f] font-semibold underline underline-offset-8 decoration-2' : ''
            }`}
          >
            FAQs
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenApply}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#047514] to-[#078d1b] hover:from-[#035e10] hover:to-[#067215] rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
          >
            Apply Now
          </button>
        </div>
      </div>
    </header>
  );
};

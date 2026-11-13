import React from 'react';
import { Shield, Lock } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="mt-16 bg-[#032912] text-white/80 border-t border-[#0b4d25] pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-white/10 text-xs sm:text-sm">
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-lg font-black text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#10b32d] flex items-center justify-center text-white text-xs">
                🇰🇪
              </span>
              <span>
                Fuliza &amp; <span className="text-[#42e46c]">M-Shwari</span>
              </span>
            </div>
            <p className="text-white/70 max-w-md text-xs leading-relaxed">
              Kenya’s premier digital mobile credit review facilitation portal for M-Shwari, Pochi la Biashara, and Fuliza ya M-PESA. Assisting entrepreneurs and individuals in prioritizing account switchboard appraisals.
            </p>
            <div className="flex items-center gap-3 text-xs text-white/60 pt-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#42e46c]" /> 256-bit SSL Security
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#42e46c]" /> Data Protection Compliant
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('calculator')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Limit Review
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('estimator')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Credit Estimator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('status')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Track Application
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('ussd')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  USSD Shortcodes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: UpesiPay Payment Gateway Info */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              M-PESA Gateway
            </h4>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5 text-xs">
              <span className="text-white/60 block">STK Gateway:</span>
              <span className="text-white/60 block text-[11px]">
                Direct Safaricom STK Push & Server Verification
              </span>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#10b32d] animate-pulse-dot" />
                <span>Instant PIN Prompt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Disclosure */}
        <div className="text-[11px] text-white/50 space-y-2 leading-relaxed">
          <p>
            <strong>Regulatory & Consumer Disclosure:</strong> This portal operates as an independent credit advisory and limit evaluation facilitation gateway. All micro-lending decisions, loan balances, interest rates, and actual disbursement tenures are subject to underwriting rules established by partner banking institutions (NCBA Bank Kenya PLC and KCB Bank Group) in conjunction with Safaricom PLC. Payment of application processing fees supports network prioritization and does not guarantee limit increments where customer credit history fails statutory CRB assessment.
          </p>
          <div className="flex flex-wrap justify-between items-center pt-4 border-t border-white/10 text-white/40">
            <div>© {new Date().getFullYear()} Fuliza &amp; M-Shwari Limit Increase. All rights reserved.</div>
            <div className="flex gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>CBK Consumer Protection</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

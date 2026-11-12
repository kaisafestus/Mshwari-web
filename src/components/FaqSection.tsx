import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { FAQS } from '../data/programs';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ccebd7] shadow-lg p-5 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#e2f8e9] text-[#078a1f] flex items-center justify-center font-bold">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#0b4d25]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Learn more about the limit review protocols, verification requirements, and processing times.
          </p>
        </div>
      </div>

      <div className="divide-y divide-[#e4f4ea]">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm sm:text-base text-slate-800 hover:text-[#078a1f] transition-colors cursor-pointer py-1"
              >
                <span>{faq.q}</span>
                <span className="p-1 rounded-md bg-[#f0f9f3] text-[#078a1f] shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>
              {isOpen && (
                <div className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pr-6">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

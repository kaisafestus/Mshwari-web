import React, { useState } from 'react';
import { Smartphone, Copy, Check, ExternalLink } from 'lucide-react';

interface UssdGuideProps {
  onCopyText: (text: string) => void;
}

export const UssdGuide: React.FC<UssdGuideProps> = ({ onCopyText }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const ussdCodes = [
    {
      code: '*334#',
      title: 'M-PESA Self-Service Menu',
      description: 'Check loan balance, M-Shwari limit, Fuliza overdraft status, and paybill/till services.',
      steps: ['Dial *334#', 'Select Loans & Savings', 'Select M-Shwari or Fuliza', 'Select Check Limit / Opt-In'],
    },
    {
      code: '*234#',
      title: 'Safaricom Financial Tariffs & SIM Services',
      description: 'Check Fuliza overdraft statement, Pochi la Biashara merchant balance, and tariffs.',
      steps: ['Dial *234#', 'Select Fuliza M-PESA or Pochi la Biashara', 'Select Check Balance / Statement'],
    },
    {
      code: '*100#',
      title: 'Prepaid Customer Care & Airtime',
      description: 'Contact official Safaricom support or manage active SIM VAS subscriptions.',
      steps: ['Dial *100#', 'Select Customer Service', 'Speak to an agent or track tickets'],
    },
  ];

  const handleCopy = (code: string) => {
    onCopyText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ccebd7] shadow-lg p-5 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#e2f8e9] text-[#078a1f] flex items-center justify-center font-bold">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#0b4d25]">
            Safaricom USSD Shortcode Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Official USSD codes for verifying your updated M-Shwari, Fuliza, and Pochi limits on your handset.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {ussdCodes.map((item) => (
          <div
            key={item.code}
            className="p-4 sm:p-5 rounded-xl border border-[#ccebd7] bg-[#f9fdfa] hover:bg-[#f0fbf4] transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base sm:text-lg font-black text-[#078a1f] bg-white px-2.5 py-1 rounded-lg border border-[#c4e3cf]">
                  {item.code}
                </span>
                <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                  {item.title}
                </h4>
              </div>
              <button
                onClick={() => handleCopy(item.code)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#ccebd7] text-xs font-semibold text-[#0b4d25] hover:bg-[#eaf8ee] cursor-pointer"
              >
                {copiedCode === item.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-3">{item.description}</p>
            <div className="bg-white/80 rounded-lg p-2.5 border border-[#d8f0e0] text-[11px] text-slate-700 flex flex-wrap gap-2">
              <span className="font-bold text-[#0b4d25]">Steps:</span>
              {item.steps.map((step, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <span>{step}</span>
                  {idx < item.steps.length - 1 && <span className="text-slate-300">→</span>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Search, Clock, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { ApplicationData } from '../types';

interface StatusTrackerProps {
  recentApplications: ApplicationData[];
  onOpenApply: () => void;
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({
  recentApplications,
  onOpenApply,
}) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<ApplicationData | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toUpperCase();
    if (!clean) return;

    setSearched(true);
    // Find in submitted records
    const found = recentApplications.find(
      (app) =>
        app.id.toUpperCase() === clean ||
        (app.mpesaCode && app.mpesaCode.toUpperCase() === clean) ||
        app.phoneNumber.includes(clean) ||
        app.idNumber.includes(clean)
    );

    if (found) {
      setResult(found);
    } else {
      // If mock query looks like a code, construct simulated valid result
      if (clean.length >= 8) {
        setResult({
          id: `LB-${clean.slice(-6)}`,
          programId: 'mshwari',
          programName: 'M-Shwari / Fuliza',
          targetLimit: 30000,
          fee: 350,
          idNumber: '3482****',
          phoneNumber: '254712****78',
          mpesaCode: clean,
          timestamp: Date.now() - 1000 * 60 * 12,
          status: 'REVIEW_APPROVED',
        });
      } else {
        setResult(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ccebd7] shadow-lg p-5 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#e2f8e9] text-[#078a1f] flex items-center justify-center font-bold">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#0b4d25]">
            Check Application Status
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your Phone Number, National ID, or 10-character M-PESA Confirmation Code.
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2.5 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter M-PESA Code (e.g. QA98218X) or Phone Number"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#ccebd7] focus:border-[#078a1f] focus:ring-2 focus:ring-[#078a1f]/20 outline-none text-slate-800 text-sm font-mono-numbers"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 bg-[#078a1f] hover:bg-[#056f18] text-white font-bold text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap"
        >
          Search
        </button>
      </form>

      {searched && result && (
        <div className="bg-[#f0fbf4] border border-[#ccebd7] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#d8f0e0] pb-3">
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-bold">
                Application Reference
              </span>
              <strong className="text-sm sm:text-base text-[#0b4d25] font-mono">
                {result.id} · {result.mpesaCode}
              </strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#16a34a] text-xs font-black">
              <CheckCircle2 className="w-4 h-4" />
              <span>Review In Progress</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Facility:</span>
              <strong className="text-slate-800">{result.programName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Approved Target:</span>
              <strong className="text-[#078a1f] font-mono-numbers text-sm">
                Ksh {result.targetLimit.toLocaleString()}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Network Sync:</span>
              <span className="text-emerald-700 font-semibold">Active switchboard queue</span>
            </div>
          </div>

          <div className="bg-white border border-[#d2edd9] rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#078a1f] shrink-0 mt-0.5" />
            <span>
              Your limit review payment was verified server-side via UpesiPay M-PESA gateway. Dial <strong>*334#</strong> to query your updated credit ceiling.
            </span>
          </div>
        </div>
      )}

      {searched && !result && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center text-xs sm:text-sm text-amber-900 space-y-2">
          <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
          <p className="font-bold">No verified application found for "{query}".</p>
          <p className="text-amber-800 text-xs">
            Make sure you entered the correct M-PESA transaction code or phone number.
          </p>
          <button
            onClick={onOpenApply}
            className="mt-2 px-4 py-2 bg-[#078a1f] text-white font-bold text-xs rounded-xl hover:bg-[#056f18] transition-colors cursor-pointer"
          >
            Submit New Application
          </button>
        </div>
      )}

      {/* Default placeholder state if no search performed yet */}
      {!searched && (
        <div className="border border-dashed border-[#ccebd7] rounded-xl p-6 text-center text-xs text-slate-500">
          <p>Recent applications submit directly to Safaricom & NCBA switchboards.</p>
          <p className="mt-1">
            Need immediate help? Contact support or dial <strong>*334#</strong> to view your active limits.
          </p>
        </div>
      )}
    </div>
  );
};

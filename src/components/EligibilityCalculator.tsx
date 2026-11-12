import React, { useState } from 'react';
import { Calculator, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface EligibilityCalculatorProps {
  onApplyEstimated: (amount: number) => void;
}

export const EligibilityCalculator: React.FC<EligibilityCalculatorProps> = ({
  onApplyEstimated,
}) => {
  const [monthlyTurnover, setMonthlyTurnover] = useState(45000);
  const [simAgeMonths, setSimAgeMonths] = useState(24);
  const [hasLockSavings, setHasLockSavings] = useState(true);
  const [repaidOnTime, setRepaidOnTime] = useState(true);

  // Estimator calculation formula
  const baseLimit = Math.round(monthlyTurnover * 0.45);
  const ageMultiplier = Math.min(1.4, 0.8 + (simAgeMonths / 36) * 0.4);
  const savingsMultiplier = hasLockSavings ? 1.25 : 1.0;
  const repaymentMultiplier = repaidOnTime ? 1.3 : 0.85;

  const estimatedLimit = Math.min(
    100000,
    Math.max(5000, Math.round((baseLimit * ageMultiplier * savingsMultiplier * repaymentMultiplier) / 500) * 500)
  );

  return (
    <div className="bg-white rounded-2xl border border-[#ccebd7] shadow-lg p-5 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#e2f8e9] text-[#078a1f] flex items-center justify-center font-bold">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#0b4d25]">
            M-PESA Credit Limit Estimator
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Check your projected borrowing capacity based on monthly transactions and account age.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Monthly Turnover */}
        <div>
          <div className="flex justify-between items-center mb-1.5 text-xs sm:text-sm">
            <span className="font-bold text-slate-700">Estimated Monthly M-PESA Volume (Ksh):</span>
            <span className="font-black text-[#078a1f] font-mono-numbers text-base">
              Ksh {monthlyTurnover.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="150000"
            step="5000"
            value={monthlyTurnover}
            onChange={(e) => setMonthlyTurnover(Number(e.target.value))}
            className="w-full accent-[#078a1f] cursor-pointer h-2 bg-[#d7ede0] rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono-numbers mt-1">
            <span>Ksh 10k</span>
            <span>Ksh 75k</span>
            <span>Ksh 150k+</span>
          </div>
        </div>

        {/* SIM Card Age */}
        <div>
          <div className="flex justify-between items-center mb-1.5 text-xs sm:text-sm">
            <span className="font-bold text-slate-700">How long has this Safaricom SIM been active?</span>
            <span className="font-bold text-slate-800">
              {simAgeMonths >= 36 ? '3+ Years' : `${simAgeMonths} Months`}
            </span>
          </div>
          <input
            type="range"
            min="6"
            max="36"
            step="6"
            value={simAgeMonths}
            onChange={(e) => setSimAgeMonths(Number(e.target.value))}
            className="w-full accent-[#078a1f] cursor-pointer h-2 bg-[#d7ede0] rounded-lg appearance-none"
          />
        </div>

        {/* Qualifying factors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-[#ccebd7] bg-[#f9fdfa] cursor-pointer hover:bg-[#f0fbf4] transition-colors">
            <input
              type="checkbox"
              checked={hasLockSavings}
              onChange={(e) => setHasLockSavings(e.target.checked)}
              className="w-4 h-4 accent-[#078a1f] rounded"
            />
            <span className="text-xs font-semibold text-slate-700">
              Active M-Shwari Lock Savings Account
            </span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-[#ccebd7] bg-[#f9fdfa] cursor-pointer hover:bg-[#f0fbf4] transition-colors">
            <input
              type="checkbox"
              checked={repaidOnTime}
              onChange={(e) => setRepaidOnTime(e.target.checked)}
              className="w-4 h-4 accent-[#078a1f] rounded"
            />
            <span className="text-xs font-semibold text-slate-700">
              Good repayment record (no late Fuliza defaults)
            </span>
          </label>
        </div>

        {/* Calculation Outcome */}
        <div className="bg-gradient-to-br from-[#054d21] to-[#013314] text-white rounded-2xl p-6 text-center shadow-md">
          <div className="text-xs uppercase tracking-wider text-emerald-300 font-bold mb-1">
            Projected Maximum Limit Tier
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono-numbers mb-2">
            Ksh {estimatedLimit.toLocaleString()}
          </div>
          <p className="text-xs text-white/80 max-w-md mx-auto mb-5">
            Based on your estimated transactions and account age, your profile qualifies for top-bracket queue evaluation.
          </p>

          <button
            onClick={() => onApplyEstimated(estimatedLimit)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#42e46c] hover:bg-[#34c759] text-[#003817] font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <span>Apply for Ksh {estimatedLimit.toLocaleString()} Limit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

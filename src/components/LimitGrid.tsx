import React, { useState } from 'react';
import { CheckCircle2, Zap, ArrowRight, CreditCard, Info, Sliders } from 'lucide-react';
import { LimitOption, ProgramConfig } from '../types';

interface LimitGridProps {
  program: ProgramConfig;
  selectedLimit: LimitOption;
  onSelectLimit: (limit: LimitOption) => void;
  onContinue: () => void;
}

export const LimitGrid: React.FC<LimitGridProps> = ({
  program,
  selectedLimit,
  onSelectLimit,
  onContinue,
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customAmount, setCustomAmount] = useState<number>(32000);

  // Dynamic fee calculation for custom amount: tiered fee structure
  const calculateCustomFee = (amt: number): number => {
    if (amt <= 15000) return Math.round(amt * 0.011);
    if (amt <= 30000) return Math.round(amt * 0.012);
    if (amt <= 50000) return Math.round(amt * 0.010);
    return Math.round(amt * 0.025);
  };

  const handleCustomChange = (val: number) => {
    const clamped = Math.max(5000, Math.min(150000, val));
    setCustomAmount(clamped);
    const fee = calculateCustomFee(clamped);
    onSelectLimit({
      amount: clamped,
      fee: fee,
      badge: 'Custom Choice',
      badgeClass: 'popular',
    });
  };

  return (
    <div id="packages-section" className="bg-white rounded-2xl border border-[#ccebd7] shadow-xl p-4 sm:p-6 md:p-8 scroll-mt-24">
      {/* Selection Heading */}
      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#10b32d] to-[#04771b] flex items-center justify-center text-white shrink-0 shadow-xs">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0b4d25] tracking-tight">
            Choose your {program.name} limit
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Select the amount that works best for your personal or enterprise needs.
          </p>
        </div>
      </div>

      {/* Info notice box */}
      <div className="bg-gradient-to-r from-[#eaf9ef] to-[#e4f7eb] border border-[#c6ead3] rounded-xl p-3 sm:p-3.5 mb-5 flex items-start sm:items-center gap-2.5 text-xs sm:text-sm text-[#1b4e2f]">
        <Info className="w-4 h-4 text-[#078a1f] shrink-0 mt-0.5 sm:mt-0" />
        <span>
          Choose a target limit and submit your application for review. Processing fee facilitates network queue prioritization.
        </span>
      </div>

      {/* Kenya Flag Inspired Tricolor Accent Strip */}
      <div className="h-1.5 rounded-full overflow-hidden flex mb-5 shadow-2xs">
        <div className="w-[30%] bg-[#074c20]" />
        <div className="w-[15%] bg-[#b5122b]" />
        <div className="w-[55%] bg-[#0a9b22]" />
      </div>

      {/* Inner Card Section */}
      <div className="border border-[#ccebd7] rounded-xl p-4 sm:p-5 bg-white shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-[#0b4d25] font-extrabold text-base">
            <span className="w-6 h-6 rounded bg-[#078a1f] flex items-center justify-center text-white">
              <CreditCard className="w-3.5 h-3.5" />
            </span>
            <span>{program.cardTitle}</span>
          </div>

          {/* Toggle Preset vs Custom */}
          <div className="flex items-center gap-1 bg-[#f0f6f1] p-1 rounded-lg border border-[#d6ecdc] text-xs">
            <button
              onClick={() => {
                setIsCustomMode(false);
                onSelectLimit(program.limits[0]);
              }}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                !isCustomMode ? 'bg-white text-[#0b4d25] shadow-xs' : 'text-slate-600 hover:text-[#0b4d25]'
              }`}
            >
              Recommended Tiers
            </button>
            <button
              onClick={() => {
                setIsCustomMode(true);
                handleCustomChange(customAmount);
              }}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isCustomMode ? 'bg-white text-[#0b4d25] shadow-xs' : 'text-slate-600 hover:text-[#0b4d25]'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Custom Amount</span>
            </button>
          </div>
        </div>

        {/* Tiers Grid */}
        {!isCustomMode ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
            {program.limits.map((item) => {
              const isSelected = selectedLimit.amount === item.amount;
              return (
                <button
                  key={item.amount}
                  onClick={() => {
                    onSelectLimit(item);
                    onContinue();
                  }}
                  className={`relative p-3 sm:p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[90px] ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#f2fcf5] to-white border-[#078a1f] shadow-md ring-2 ring-[#078a1f]/20 scale-[1.02]'
                      : 'bg-white border-[#ccebd7] hover:border-[#078a1f]/60 hover:shadow-2xs'
                  }`}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-[#078a1f]">
                      <CheckCircle2 className="w-4 h-4 fill-[#078a1f] text-white" />
                    </div>
                  )}

                  {/* Badge */}
                  {item.badge && (
                    <span
                      className={`absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow-xs ${
                        item.badgeClass === 'popular'
                          ? 'bg-[#f59e0b]'
                          : item.badgeClass === 'premium'
                          ? 'bg-[#2563eb]'
                          : 'bg-[#e11d48]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  <div className="text-base sm:text-lg font-black text-[#0b4d25] mb-1.5 font-mono-numbers">
                    Ksh {item.amount.toLocaleString()}
                  </div>

                  <div
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors font-mono-numbers ${
                      isSelected
                        ? 'bg-[#078a1f] text-white'
                        : 'bg-[#f0f4f2] text-slate-600'
                    }`}
                  >
                    {item.originalFee ? (
                      <span>
                        <span className="line-through opacity-70 mr-1 font-normal text-[11px]">
                          Ksh {item.originalFee.toLocaleString()}
                        </span>
                        Ksh {item.fee.toLocaleString()}
                      </span>
                    ) : (
                      <span>Fee: Ksh {item.fee.toLocaleString()}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Custom Amount Range & Input Slider */
          <div className="bg-[#f7fcf8] border border-[#ccebd7] rounded-xl p-5 mb-6 text-center">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
              Specify Desired Capital Limit
            </div>
            <div className="text-3xl font-black text-[#0b4d25] mb-3 font-mono-numbers">
              Ksh {customAmount.toLocaleString()}
            </div>

            <div className="max-w-md mx-auto mb-4">
              <input
                type="range"
                min="5000"
                max="120000"
                step="2500"
                value={customAmount}
                onChange={(e) => handleCustomChange(Number(e.target.value))}
                className="w-full accent-[#078a1f] cursor-pointer h-2 bg-[#d2edd9] rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono-numbers mt-1.5">
                <span>Ksh 5,000</span>
                <span>Ksh 50,000</span>
                <span>Ksh 120,000</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-[#e2f8e9] text-[#0b4d25] px-4 py-1.5 rounded-full text-xs font-bold font-mono-numbers">
              <span>Required Review Fee:</span>
              <span className="text-sm font-extrabold text-[#078a1f]">
                Ksh {calculateCustomFee(customAmount).toLocaleString()}
              </span>
            </div>

            <div className="mt-4">
              <button
                onClick={onContinue}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#047514] to-[#078d1b] hover:from-[#035e10] hover:to-[#067215] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Apply for Ksh {customAmount.toLocaleString()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Primary CTA Button */}
        <button
          onClick={onContinue}
          className="w-full h-14 bg-gradient-to-r from-[#047514] via-[#078d1b] to-[#047514] hover:from-[#035f10] hover:to-[#056f15] text-white font-extrabold text-base sm:text-lg rounded-2xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.99]"
        >
          <Zap className="w-5 h-5 fill-white" />
          <span>Get Ksh {selectedLimit.amount.toLocaleString()} Now</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Security Assurances */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t border-[#d8f0e0]">
          <div className="flex items-center gap-2 text-[#0b4d25] p-2 rounded-lg bg-[#f9fdfa]">
            <div className="w-8 h-8 rounded-full bg-[#e3f7ea] flex items-center justify-center text-[#078a1f] shrink-0 font-bold text-xs">
              ✓
            </div>
            <div className="text-left">
              <strong className="block text-xs font-bold leading-tight">Bank Secure</strong>
              <small className="text-[10px] text-slate-500 leading-tight">256-bit encryption</small>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#0b4d25] p-2 rounded-lg bg-[#f9fdfa]">
            <div className="w-8 h-8 rounded-full bg-[#e3f7ea] flex items-center justify-center text-[#078a1f] shrink-0 font-bold text-xs">
              ⚡
            </div>
            <div className="text-left">
              <strong className="block text-xs font-bold leading-tight">Instant STK</strong>
              <small className="text-[10px] text-slate-500 leading-tight">Direct to phone</small>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#0b4d25] p-2 rounded-lg bg-[#f9fdfa]">
            <div className="w-8 h-8 rounded-full bg-[#e3f7ea] flex items-center justify-center text-[#078a1f] shrink-0 font-bold text-xs">
              🛡️
            </div>
            <div className="text-left">
              <strong className="block text-xs font-bold leading-tight">Data Protected</strong>
              <small className="text-[10px] text-slate-500 leading-tight">DPA 2019 compliant</small>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#0b4d25] p-2 rounded-lg bg-[#f9fdfa]">
            <div className="w-8 h-8 rounded-full bg-[#e3f7ea] flex items-center justify-center text-[#078a1f] shrink-0 font-bold text-xs">
              🔒
            </div>
            <div className="text-left">
              <strong className="block text-xs font-bold leading-tight">Server Verified</strong>
              <small className="text-[10px] text-slate-500 leading-tight">UpesiPay Channel 270</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

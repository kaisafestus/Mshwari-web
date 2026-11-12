import React from 'react';
import { PiggyBank, Briefcase, Zap, Landmark } from 'lucide-react';
import { ProgramConfig } from '../types';

interface ProgramSelectorProps {
  programs: Record<string, ProgramConfig>;
  selectedProgramKey: string;
  onSelectProgram: (key: string) => void;
}

export const ProgramSelector: React.FC<ProgramSelectorProps> = ({
  programs,
  selectedProgramKey,
  onSelectProgram,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'mshwari':
        return <PiggyBank className="w-5 h-5 text-[#078a1f]" />;
      case 'fuliza':
        return <Briefcase className="w-5 h-5 text-[#078a1f]" />;
      case 'fuliza_personal':
        return <Zap className="w-5 h-5 text-[#078a1f]" />;
      case 'kcb_mpesa':
        return <Landmark className="w-5 h-5 text-[#078a1f]" />;
      default:
        return <PiggyBank className="w-5 h-5 text-[#078a1f]" />;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {Object.values(programs).map((prog) => {
        const isSelected = prog.id === selectedProgramKey;
        return (
          <button
            key={prog.id}
            onClick={() => onSelectProgram(prog.id)}
            className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer relative ${
              isSelected
                ? 'bg-gradient-to-br from-[#f2fdf5] to-white border-[#078a1f] shadow-md ring-2 ring-[#078a1f]/20 scale-[1.01]'
                : 'bg-white border-[#ccebd7] hover:border-[#078a1f]/60 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#e2f8e9]' : 'bg-[#f4faf5]'}`}>
                {getIcon(prog.id)}
              </span>
              <span className={`font-extrabold text-sm sm:text-base ${isSelected ? 'text-[#0b4d25]' : 'text-slate-800'}`}>
                {prog.name}
              </span>
            </div>
            <p className={`text-xs leading-snug ${isSelected ? 'text-[#078a1f] font-semibold' : 'text-slate-500'}`}>
              {prog.id === 'mshwari' && 'Boost M-Shwari savings & loan limit'}
              {prog.id === 'fuliza' && 'Boost Pochi la Biashara merchant float'}
              {prog.id === 'fuliza_personal' && 'Continuous personal overdraft limit'}
              {prog.id === 'kcb_mpesa' && 'Higher borrowing 30-day tenor'}
            </p>
          </button>
        );
      })}
    </div>
  );
};

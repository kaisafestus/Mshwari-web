import React from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#073819] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#10b32d]/40 animate-in slide-in-from-bottom-5 duration-200">
      <div className="w-5 h-5 rounded-full bg-[#10b32d] flex items-center justify-center text-white shrink-0">
        <Check className="w-3.5 h-3.5" />
      </div>
      <span className="text-xs sm:text-sm font-semibold">{message}</span>
    </div>
  );
};

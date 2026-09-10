'use client';

import React, { useState } from 'react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('3001234567');
  const [otp, setOtp] = useState('1234');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setStep('OTP');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setStep('PHONE');
      onClose();
    }, 1200);
  };

  const handleGuest = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F15B25] to-[#E63946] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition"
            aria-label="Close Auth"
          >
            ✕
          </button>
          <div className="h-12 w-12 rounded-full bg-white text-[#F15B25] font-black text-2xl mx-auto flex items-center justify-center shadow-md mb-2">
            C
          </div>
          <h2 className="text-xl font-black">Welcome to Cheezious</h2>
          <p className="text-xs text-orange-100 mt-0.5">Login with your mobile number to get started</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isSuccess ? (
            <div className="text-center py-8 space-y-2">
              <div className="text-4xl">🎉</div>
              <h3 className="text-lg font-black text-emerald-600">Successfully Signed In!</h3>
              <p className="text-xs text-gray-500">Welcome back to Cheezious.</p>
            </div>
          ) : step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="flex rounded-xl border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-[#F15B25]">
                  <span className="px-3.5 py-3 bg-gray-100 text-gray-700 font-bold text-sm border-r border-gray-300 flex items-center gap-1">
                    <span>🇵🇰</span>
                    <span>+92</span>
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-3 text-sm focus:outline-none font-bold"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#F15B25] hover:bg-[#d94a18] text-white font-extrabold rounded-xl shadow-md transition text-sm"
              >
                Send Verification Code
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200" />
                <span className="flex-shrink mx-3 text-gray-400 text-xs uppercase font-bold">Or</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              <button
                type="button"
                onClick={handleGuest}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition"
              >
                Continue as Guest
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Enter 4-Digit OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('PHONE')}
                    className="text-xs text-[#F15B25] font-bold hover:underline"
                  >
                    Edit Phone
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="1234"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-xl tracking-widest font-black focus:outline-none focus:ring-2 focus:ring-[#F15B25]"
                  autoFocus
                />
                <p className="text-[11px] text-gray-400 mt-1 text-center">
                  Demo code <strong className="text-gray-700">1234</strong> is pre-filled for testing.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#F15B25] hover:bg-[#d94a18] text-white font-extrabold rounded-xl shadow-md transition text-sm"
              >
                Verify & Continue
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

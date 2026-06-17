/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle,
  AlertTriangle,
  ArrowLeft 
} from 'lucide-react';
import { AppView } from '../types';

interface VerifyOTPViewProps {
  onNavigate: (view: AppView) => void;
  onResetSuccess: () => void;
}

export default function VerifyOTPView({ onNavigate, onResetSuccess }: VerifyOTPViewProps) {
  const [emailInput, setEmailInput] = useState('admin@sipma.edu');
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next field
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const verifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpCode.join('');
    if (fullCode.length < 4) {
      setErrorMsg('Please enter the full 4-digit verification code.');
      return;
    }
    // Simulate valid code (any 4-digit code is valid for mock)
    setIsCodeVerified(true);
    setErrorMsg('');
    setSuccessMsg('Code verified successfully. Please configure your new password.');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setSuccessMsg('Your security credentials have been successfully reset.');
    setErrorMsg('');
    setTimeout(() => {
      onResetSuccess();
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-[#FDFAF5] flex items-center justify-center font-sans relative selection:bg-[#bfc5e7]/50 select-none">
      {/* Background radial visual aid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#D4C9B0 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10 w-full max-w-[920px] h-[92vh] max-h-[600px] bg-white rounded-lg border border-[#c6c6ce] shadow-2xl flex overflow-hidden">
        
        {/* Left Side: Security protocols */}
        <section className="w-5/12 bg-[#0c132c] p-8 text-white flex flex-col justify-between border-r border-[#212842]">
          <div>
            <div className="flex items-center gap-2 text-[#888fae] mb-4">
              <Key className="w-5 h-5" />
              <span className="text-xs uppercase font-extrabold tracking-widest">Protocol Setup</span>
            </div>
            
            <h2 className="text-xl font-bold tracking-tight mb-2">Password Reset</h2>
            <p className="text-xs text-[#888fae] leading-relaxed mb-8">
              Verify your identity via two-factor security link to complete administrative credential reset.
            </p>

            <div className="space-y-4">
              <div className="bg-[#212842] p-4 rounded-sm border border-[#3f4661]/40 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-[10px] text-white/90 leading-normal font-medium">
                  Verification OTP code remains active for 10 minutes. Afterwards, you must request a new reset ticket.
                </p>
              </div>

              <div className="bg-[#212842] p-4 rounded-sm border border-[#3f4661]/40">
                <p className="text-[10px] text-[#888fae] font-semibold uppercase tracking-wider mb-2">Logs & Security</p>
                <p className="text-[10px] text-white/80 leading-normal">
                  All security credential modifications record user IP address, device telemetry, and location tags.
                </p>
              </div>
            </div>
          </div>

          <div>
            <button 
              onClick={() => onNavigate('login')}
              className="flex items-center gap-2 text-xs font-bold text-[#888fae] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Login</span>
            </button>
          </div>
        </section>

        {/* Right Side: Verification fields */}
        <section className="w-7/12 p-10 bg-[#FDFAF5] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0c132c] tracking-tight">Security Verification</h3>
            <p className="text-xs text-[#46464d] font-semibold mt-1">
              Verify the code dispatched to: <span className="font-bold underline text-[#0c132c]">{emailInput}</span>
            </p>

            {errorMsg && (
              <div className="mt-6 p-3 bg-red-100/90 border border-[#ba1a1a]/40 text-[#ba1a1a] text-xs font-semibold rounded-sm">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mt-6 p-3 bg-green-100/90 border border-green-400/40 text-emerald-800 text-xs font-semibold rounded-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {!isCodeVerified ? (
              /* Code verification stage */
              <form onSubmit={verifyCode} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">4-Digit Security Code</label>
                  <div className="flex gap-4 scroll-my-3">
                    {otpCode.map((digit, index) => (
                      <input 
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        placeholder="0"
                        className="w-14 h-16 bg-white border border-[#D4C9B0] outline-none text-center text-2xl font-bold text-[#0c132c] transition-all focus:border-2 focus:border-[#0c132c]"
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-[#0c132c] text-white py-3.5 font-bold text-sm uppercase tracking-wider hover:bg-[#212842] active:opacity-90 shadow-md transition-all cursor-pointer"
                  >
                    Verify Code
                  </button>
                </div>
              </form>
            ) : (
              /* New password generation stage */
              <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">New Security Password</label>
                  <div className="relative">
                    <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white px-4 py-3 border border-[#D4C9B0] outline-none transition-all text-sm font-medium focus:border-2 focus:border-[#0c132c]"
                    />
                    <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#76767e] hover:text-[#0c132c] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Confirm Password</label>
                  <div className="relative">
                    <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white px-4 py-3 border border-[#D4C9B0] outline-none transition-all text-sm font-medium focus:border-2 focus:border-[#0c132c]"
                    />
                    <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#76767e] hover:text-[#0c132c] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-emerald-700 text-white py-3.5 font-bold text-sm uppercase tracking-wider hover:bg-emerald-800 active:opacity-90 shadow-md transition-all cursor-pointer"
                  >
                    Verify & Reset Password
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-[10px] text-[#46464d] mt-4 leading-normal select-none">
            Didn't receive the OTP ticket?{' '}
            <button 
              type="button" 
              onClick={() => {
                setOtpCode(['', '', '', '']);
                alert('Verification token re-dispatched to admin@sipma.edu');
              }} 
              className="text-[#0c132c] font-bold underline hover:opacity-80"
            >
              Click here to resend link
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}

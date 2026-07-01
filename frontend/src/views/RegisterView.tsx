/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  TrendingUp,
  IdCard,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Info,
  Shirt,
  Sparkles,
  Layers,
  CircleDot,
  GraduationCap,
  X,
  Copy,
  Check
} from 'lucide-react';
import { AppView } from '../types';

interface RegisterViewProps {
  onNavigate: (view: AppView) => void;
  onRegisterSuccess: () => void;
}

export default function RegisterView({ onNavigate, onRegisterSuccess }: RegisterViewProps) {
  const [fullName, setFullName] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [copied, setCopied] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !userId || !email || !password || !confirmPassword) {
      setErrorMsg('Semua kolom wajib diisi');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Password tidak cocok');
      return;
    }

    try {
      // 1. Register the user in backend (using email as username)
      const regResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password: password,
          fullName: fullName,
          role: 'Academic Inspector',
          department: 'Panitia Monitor'
        }),
      });

      const regData = await regResponse.json();

      if (!regResponse.ok || !regData.success) {
        setErrorMsg(regData.message || 'Registrasi gagal. Username/Email mungkin sudah terdaftar.');
        return;
      }

      // Gunakan OTP dari data registrasi jika ada (bypass dev mode)
      setGeneratedOtp(regData.otp || '');
      setStep('otp');
      setErrorMsg('');
      if (regData.otp) {
        console.log(`[SIPMA OTP Dev Bypass]: Kode OTP Anda adalah ${regData.otp}`);
      }
    } catch (err) {
      console.error('Register error:', err);
      setErrorMsg('Gagal terhubung ke server backend.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next field
    if (value && index < 5) {
      const nextInput = document.getElementById(`register-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`register-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpCode.join('');
    if (fullCode.length < 6) {
      setErrorMsg('Harap masukkan semua 6 digit kode OTP');
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          otp: fullCode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setErrorMsg('');
        onRegisterSuccess();
      } else {
        setErrorMsg(data.message || 'Kode OTP tidak valid.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setErrorMsg('Gagal terhubung ke server.');
    }
  };

  return (
    <div className="w-full h-full bg-white flex font-sans relative selection:bg-[#bfc5e7]/50 overflow-hidden select-none">
      {/* Grid bento pattern backdrops */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#D4C9B0 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Form Container - Full Screen Layout */}
      <main className="relative z-10 w-full h-full grid grid-cols-12 bg-white overflow-hidden">

        {/* Left column sidebar block */}
        <section className="col-span-12 md:col-span-5 bg-[#0c132c] p-10 flex flex-col justify-between text-white border-r border-[#212842]">
          <div>
            <div className="flex items-center gap-3 mb-2 cursor-pointer transition-opacity hover:opacity-90" onClick={() => onNavigate('login')}>
              <GraduationCap className="w-8 h-8 text-white scale-110" />
              <h1 className="font-sans text-2xl font-bold tracking-tight text-white select-none">SIPMA</h1>
            </div>
            <p className="text-xs text-[#888fae] font-semibold leading-relaxed">Sistem Pendeteksi Atribut Mahasiswa Baru Informatika</p>

            <div className="mt-12 md:mt-16 space-y-6">
              {/* Feature items */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded bg-[#3f4661] flex items-center justify-center text-white shrink-0 shadow">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider">Deteksi Atribut</h3>
                  <p className="text-xs text-[#888fae] leading-relaxed mt-1">Pengenalan dan pemrosesan atribut mahasiswa tingkat lanjut.</p>

                  {/* Detailed attributes inside register view */}
                  <div className="mt-4 bg-[#1b2342]/60 rounded-xl border border-[#D4C9B0]/15 p-4 space-y-3 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-inner shrink-0">
                        <Shirt className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-xs text-slate-100 tracking-wide">Kemeja Putih</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center shadow-inner shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-xs text-pink-300 tracking-wide">Kerudung Pink</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center justify-center shadow-inner shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-xs text-indigo-200 tracking-wide">Rok/Celana</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-inner shrink-0">
                        <CircleDot className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-xs text-amber-200 tracking-wide">Ikat Pinggang</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shadow-inner shrink-0">
                        <IdCard className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-xs text-cyan-200 tracking-wide">Nametag</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#3f4661]/40 pt-4 space-y-4">
            <div className="p-4 bg-[#212842] border border-[#3f4661]/30 rounded-sm flex items-start gap-3">
              <Info className="w-4 h-4 text-[#e8dec8] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white tracking-wide">Verifikasi OTP Diperlukan</p>
                <p className="text-[10px] text-[#888fae] mt-1 leading-normal font-semibold">
                  Demi keamanan administratif, setiap registrasi akun komite baru wajib memvalidasi kode 6-digit di email mereka.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse pointer-events-none" />
              <span className="text-xs font-semibold text-[#888fae]">Status Sistem: Aktif</span>
            </div>
          </div>
        </section>

        {/* Right column form block */}
        <section className="col-span-12 md:col-span-7 p-10 md:p-14 bg-[#FDFAF5] flex flex-col justify-between overflow-y-auto">
          {step === 'form' ? (
            <>
              <header className="mb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-[#0c132c] tracking-tight">Daftar sebagai Pengguna</h2>
                  <p className="text-xs text-[#46464d] font-semibold mt-1">Isi formulir di bawah ini untuk membuat akun baru.</p>
                </div>
              </header>

              <form className="grid grid-cols-2 gap-x-4 gap-y-4" onSubmit={handleRegister}>
                {errorMsg && (
                  <div className="col-span-2 p-3 bg-red-100/90 border border-[#ba1a1a]/40 text-[#ba1a1a] text-xs font-semibold rounded-sm">
                    {errorMsg}
                  </div>
                )}

                {/* Full Name */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Nama Lengkap</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap resmi Anda"
                      className="w-full bg-white px-4 py-3 border border-[#D4C9B0] outline-none transition-all text-sm font-medium focus:border-2 focus:border-[#0c132c]"
                    />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#76767e]" />
                  </div>
                </div>

                {/* User ID */}
                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">User ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="contoh: ADM-2024-01"
                      className="w-full bg-white px-4 py-3 border border-[#D4C9B0] outline-none transition-all text-sm font-medium focus:border-2 focus:border-[#0c132c]"
                    />
                    <IdCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#76767e]" />
                  </div>
                </div>

                {/* Email Address */}
                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Alamat Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="work@sipma.edu"
                      className="w-full bg-white px-4 py-3 border border-[#D4C9B0] outline-none transition-all text-sm font-medium focus:border-2 focus:border-[#0c132c]"
                    />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#76767e]" />
                  </div>
                </div>

                {/* Password */}
                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* Confirm Password */}
                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Konfirmasi Password</label>
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

                {/* Submit */}
                <div className="col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#0c132c] text-white py-3.5 font-bold text-sm uppercase tracking-wider shadow-md hover:bg-[#212842] active:opacity-90 transition-all cursor-pointer"
                  >
                    Daftarkan Akun & Kirim OTP
                  </button>
                </div>
              </form>

              <footer className="mt-4 text-center">
                <p className="text-xs text-[#46464d] font-semibold">
                  Sudah punya akun?{' '}
                  <button
                    onClick={() => onNavigate('login')}
                    className="text-[#0c132c] font-bold underline underline-offset-4 hover:opacity-85 cursor-pointer ml-1"
                  >
                    Login
                  </button>
                </p>
              </footer>
            </>
          ) : (
            <>
              <header className="mb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-[#0c132c] tracking-tight">Verifikasi Email Anda</h2>
                  <p className="text-xs text-[#46464d] font-semibold mt-1">
                    Masukkan 6-digit kode keamanan yang telah dikirim ke alamat email:{' '}
                    <span className="font-bold text-[#0c132c] underline">{email}</span>
                  </p>
                </div>
              </header>

              <form className="space-y-6" onSubmit={handleVerifyOtp}>
                {errorMsg && (
                  <div className="p-3 bg-red-100/90 border border-[#ba1a1a]/40 text-[#ba1a1a] text-xs font-semibold rounded-sm">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">6-Digit Kode OTP</label>
                  <div className="flex gap-2 sm:gap-3 justify-between">
                    {otpCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`register-otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        placeholder="•"
                        className="w-10 h-14 sm:w-12 sm:h-16 bg-white border border-[#D4C9B0] outline-none text-center text-xl sm:text-2xl font-bold text-[#0c132c] transition-all focus:border-2 focus:border-[#0c132c] select-all"
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#0c132c] text-white py-3.5 font-bold text-sm uppercase tracking-wider shadow-md hover:bg-[#212842] active:opacity-90 transition-all cursor-pointer"
                  >
                    Verifikasi & Aktifkan Akun
                  </button>
                </div>
              </form>

              <footer className="mt-4 text-center space-y-2">
                <button
                  type="button"
                  onClick={async () => {
                    setErrorMsg('');
                    try {
                      const otpResponse = await fetch('/api/auth/request-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: email }),
                      });
                      const otpData = await otpResponse.json();
                      if (otpResponse.ok && otpData.success) {
                        setGeneratedOtp(otpData.otp || '');
                        setOtpCode(['', '', '', '', '', '']);
                        alert('Kode OTP baru telah dikirim ke email Anda.');
                      } else {
                        setErrorMsg(otpData.message || 'Gagal mengirim ulang kode OTP.');
                      }
                    } catch (err) {
                      setErrorMsg('Gagal terhubung ke server.');
                    }
                  }}
                  className="text-xs text-[#0c132c] font-bold underline hover:opacity-85 mr-3 cursor-pointer"
                >
                  Kirim Ulang OTP
                </button>
                <span className="text-xs text-[#76767e]">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setErrorMsg('');
                  }}
                  className="text-xs text-[#0c132c] font-bold underline hover:opacity-85 ml-3 cursor-pointer"
                >
                  Ganti Data / Masukan Ulang
                </button>
              </footer>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

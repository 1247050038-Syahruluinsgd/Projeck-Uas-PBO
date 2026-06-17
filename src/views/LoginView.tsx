/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  GraduationCap, 
  Mail, 
  LayoutGrid,
  Shirt,
  Sparkles,
  Layers,
  CircleDot,
  IdCard
} from 'lucide-react';
import { ASSET_URLS } from '../data';
import { AppView } from '../types';

interface LoginViewProps {
  onNavigate: (view: AppView) => void;
  onLoginSuccess: (userId: string) => void;
}

export default function LoginView({ onNavigate, onLoginSuccess }: LoginViewProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setErrorMsg('User ID tidak boleh kosong');
      return;
    }
    if (!password) {
      setErrorMsg('Password tidak boleh kosong');
      return;
    }
    // Simulate successful login
    onLoginSuccess(userId);
  };

  return (
    <div className="w-full h-full bg-[#FDFAF5] flex overflow-hidden border border-[#D4C9B0] relative font-sans selection:bg-[#bfc5e7]/50 shadow-2xl">
      {/* Left Panel: Illustration & Branding */}
      <section className="w-1/2 h-full bg-[#0c132c] flex flex-col justify-between p-8 text-white">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-white scale-110" />
            <h2 className="font-sans text-2xl font-bold tracking-tight text-white select-none">SIPMA</h2>
          </div>
          <p className="text-xs text-[#888fae] font-semibold leading-relaxed mt-1">Sistem Pendeteksi Atribut Mahasiswa Baru Informatika</p>
        </div>

        <div className="flex-grow flex flex-col justify-center items-start">
          <h1 className="font-sans text-[48px] leading-[54px] font-extrabold mb-4 text-white tracking-tight select-none">
            Welcome Back
          </h1>
          <p className="text-[#888fae] text-[15px] leading-[22px] max-w-sm select-none">
            Masuk untuk mengakses sistem SIPMA. Kelola deteksi atribut mahasiswa baru informatika
          </p>

          {/* List of Attribute Criteria */}
          <div className="mt-8 w-full bg-[#1b2342]/60 rounded-xl border border-[#D4C9B0]/20 p-5 space-y-3 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-4 transition-transform hover:translate-x-1 duration-300">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                <Shirt className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <span className="font-semibold text-sm text-slate-100 tracking-wide">Kemeja Putih</span>
                <p className="text-[10px] text-[#888fae] leading-none mt-1">Atribut pakaian standar wajib</p>
              </div>
            </div>

            <div className="flex items-center gap-4 transition-transform hover:translate-x-1 duration-300">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <span className="font-semibold text-sm text-pink-300 tracking-wide">Kerudung Pink</span>
                <p className="text-[10px] text-[#888fae] leading-none mt-1">Ketentuan jilbab seragam mahasiswi</p>
              </div>
            </div>

            <div className="flex items-center gap-4 transition-transform hover:translate-x-1 duration-300">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center justify-center shadow-inner">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <span className="font-semibold text-sm text-indigo-200 tracking-wide">Rok/Celana</span>
                <p className="text-[10px] text-[#888fae] leading-none mt-1">Bawahan formal kelengkapan seragam</p>
              </div>
            </div>

            <div className="flex items-center gap-4 transition-transform hover:translate-x-1 duration-300">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-inner">
                <CircleDot className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <span className="font-semibold text-sm text-amber-200 tracking-wide">Ikat Pinggang</span>
                <p className="text-[10px] text-[#888fae] leading-none mt-1">Sabuk formal warna gelap</p>
              </div>
            </div>

            <div className="flex items-center gap-4 transition-transform hover:translate-x-1 duration-300">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shadow-inner">
                <IdCard className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <span className="font-semibold text-sm text-cyan-200 tracking-wide">Nametag</span>
                <p className="text-[10px] text-[#888fae] leading-none mt-1">Tanda pengenal resmi mahasiswa</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[#888fae] text-xs font-medium select-none">
          © 2026 Sistem SIPMA. Semua Hak Cipta Dilindungi.
        </div>
      </section>

      {/* Right Panel: Login Form */}
      <section className="w-1/2 h-full flex flex-col justify-center px-16 bg-[#FDFAF5]">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="font-sans text-[28px] font-bold text-[#0c132c] mb-2 select-none tracking-tight">Login</h2>
            <p className="text-sm text-[#46464d] select-none font-medium">Silakan masukkan detail masuk Anda untuk melanjutkan</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="p-3 bg-red-100/80 border border-[#ba1a1a]/40 text-[#ba1a1a] text-xs font-semibold rounded-sm">
                {errorMsg}
              </div>
            )}

            {/* User ID Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0c132c] block uppercase tracking-wider" htmlFor="user-id">
                User ID
              </label>
              <div className="relative flex items-center bg-white border border-[#D4C9B0] h-12 px-4 transition-all focus-within:border-2 focus-within:border-[#0c132c]">
                <User className="text-[#46464d] w-5 h-5 mr-3 shrink-0" />
                <input 
                  type="text"
                  id="user-id" 
                  name="user-id" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Masukkan ID mahasiswa atau staf Anda"
                  className="bg-transparent border-none outline-none focus:ring-0 w-full text-sm text-[#0c132c] placeholder:text-[#76767e]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#0c132c] block uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative flex items-center bg-white border border-[#D4C9B0] h-12 px-4 transition-all focus-within:border-2 focus-within:border-[#0c132c]">
                <Lock className="text-[#46464d] w-5 h-5 mr-3 shrink-0" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password" 
                  name="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent border-none outline-none focus:ring-0 w-full text-sm text-[#0c132c] placeholder:text-[#76767e]"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#46464d] hover:text-[#0c132c] transition-colors cursor-pointer shrink-0"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between select-none">
              <div className="flex items-center">
                <input 
                  type="checkbox"
                  id="remember-me" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#0c132c] border-[#D4C9B0] rounded-none focus:ring-[#0c132c] focus:ring-offset-0 cursor-pointer accent-[#0c132c]"
                />
                <label className="ml-2 text-xs text-[#46464d] font-medium cursor-pointer" htmlFor="remember-me">
                  Ingat Saya
                </label>
              </div>
              <button 
                type="button"
                onClick={() => onNavigate('verify')}
                className="text-xs text-[#0c132c] hover:underline font-bold transition-all cursor-pointer"
              >
                Lupa Password?
              </button>
            </div>

            {/* Login Button */}
            <button 
              type="submit"
              className="w-full bg-[#0c132c] hover:bg-[#212842] h-12 flex items-center justify-center gap-2 text-white font-bold text-sm tracking-wider uppercase hover:opacity-90 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md"
            >
              <span>Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Footer Link */}
            <div className="pt-6 text-center border-t border-[#D4C9B0]/60">
              <p className="text-xs font-semibold text-[#46464d]">
                Belum punya akun?{' '}
                <button 
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="text-[#0c132c] font-bold hover:underline ml-1 cursor-pointer"
                >
                  Daftar terlebih dahulu
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Email Notification Note */}
        <div className="mt-12 flex items-center gap-3 p-4 bg-[#E8DEC8]/50 border border-[#D4C9B0] max-w-md mx-auto select-none">
          <Mail className="w-5 h-5 text-[#0c132c] shrink-0" />
          <p className="text-[11px] font-semibold text-[#46464d] leading-normal">
            Semua upaya login dicatat dan dikirim ke email akademik terdaftar Anda untuk keamanan.
          </p>
        </div>
      </section>
    </div>
  );
}

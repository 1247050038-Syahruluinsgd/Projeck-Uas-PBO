/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowRight,
  User, 
  Mail, 
  IdCard, 
  Sparkles, 
  CheckCircle, 
  HelpCircle,
  HelpCircle as InfoIcon
} from 'lucide-react';
import { AppView, Gender } from '../types';
import { ASSET_URLS } from '../data';

interface DetectionInputViewProps {
  onNavigate: (view: AppView) => void;
  onInitiateDetection: (data: {
    fullName: string;
    userId: string;
    email: string;
    gender: Gender;
    hasHijab: boolean;
  }) => void;
}

export default function DetectionInputView({ onNavigate, onInitiateDetection }: DetectionInputViewProps) {
  const [fullName, setFullName] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<Gender>('Female');
  const [hasHijab, setHasHijab] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenderChange = (val: Gender) => {
    setGender(val);
    if (val === 'Female') {
      setHasHijab(true);
    } else {
      setHasHijab(false);
    }
  };

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !userId.trim() || !email.trim()) {
      setErrorMsg('Semua kolom wajib diisi sebelum memulai pemindaian.');
      return;
    }
    setErrorMsg('');
    onInitiateDetection({
      fullName,
      userId,
      email,
      gender,
      hasHijab: gender === 'Female' ? hasHijab : false
    });
  };

  return (
    <div className="flex flex-col gap-6 p-8 bg-[#FDFAF5] overflow-y-auto h-full select-none">
      
      {/* Description header */}
      <div className="bg-white border border-[#D4C9B0] p-4 flex gap-4 items-center">
        <div className="w-10 h-10 bg-[#E8DEC8] flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-[#0c132c] animate-spin" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#0c132c]">Tahap Persiapan: Pengaturan Profil</h3>
          <p className="text-xs text-[#76767e] mt-1 font-semibold">
            Tentukan identitas mahasiswa target untuk dimasukkan ke dalam sistem pemindai atribut.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Input Form (Col span 7/12) */}
        <section className="col-span-7 bg-white border border-[#D4C9B0] shadow-sm p-6 flex flex-col justify-between">
          <form onSubmit={handleStartScan} className="space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-100/90 border border-[#ba1a1a]/40 text-[#ba1a1a] text-xs font-semibold rounded-sm">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c]">Nama Lengkap Sesuai Identitas</label>
              <div className="relative flex items-center border border-[#D4C9B0] px-3.5 py-2.5 bg-white">
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="contoh: Clara Oswald"
                  className="w-full bg-transparent text-xs text-[#0c132c] font-medium placeholder:text-[#76767e] outline-none"
                />
                <User className="w-4 h-4 text-[#76767e]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c]">NIM / Kode ID Mahasiswa</label>
                <div className="relative flex items-center border border-[#D4C9B0] px-3.5 py-2.5 bg-white">
                  <input 
                    type="text" 
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="contoh: ST-202450"
                    className="w-full bg-transparent text-xs text-[#0c132c] font-medium placeholder:text-[#76767e] outline-none"
                  />
                  <IdCard className="w-4 h-4 text-[#76767e]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c]">Email Resmi</label>
                <div className="relative flex items-center border border-[#D4C9B0] px-3.5 py-2.5 bg-white">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh: clara@university.edu"
                    className="w-full bg-transparent text-xs text-[#0c132c] font-medium placeholder:text-[#76767e] outline-none"
                  />
                  <Mail className="w-4 h-4 text-[#76767e]" />
                </div>
              </div>
            </div>

            {/* Gender Selection Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Jenis Kelamin</label>
              <div className="grid grid-cols-2 gap-4">
                
                {/* Male Radio card */}
                <button
                  type="button"
                  onClick={() => handleGenderChange('Male')}
                  className={`border flex items-center justify-between p-3 cursor-pointer select-none transition-all ${
                    gender === 'Male'
                      ? 'bg-white border-2 border-[#0c132c] shadow-sm'
                      : 'bg-white border-[#D4C9B0] text-[#76767e] hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-xs font-bold ${gender === 'Male' ? 'text-[#0c132c]' : 'text-[#76767e]'}`}>Laki-laki</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${gender === 'Male' ? 'border-[#0c132c]' : 'border-[#D4C9B0]'}`}>
                    {gender === 'Male' && <div className="w-2.5 h-2.5 rounded-full bg-[#0c132c]" />}
                  </div>
                </button>

                {/* Female Radio card */}
                <button
                  type="button"
                  onClick={() => handleGenderChange('Female')}
                  className={`border flex items-center justify-between p-3 cursor-pointer select-none transition-all ${
                    gender === 'Female'
                      ? 'bg-white border-2 border-[#0c132c] shadow-sm'
                      : 'bg-white border-[#D4C9B0] text-[#76767e] hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-xs font-bold ${gender === 'Female' ? 'text-[#0c132c]' : 'text-[#76767e]'}`}>Perempuan</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${gender === 'Female' ? 'border-[#0c132c]' : 'border-[#D4C9B0]'}`}>
                    {gender === 'Female' && <div className="w-2.5 h-2.5 rounded-full bg-[#0c132c]" />}
                  </div>
                </button>

              </div>
            </div>

            {/* Dynamic Hijab toggler which triggers when gender is female */}
            {gender === 'Female' && (
              <div className="p-4 bg-[#E8DEC8]/30 border border-[#D4C9B0] flex items-center justify-between transition-all duration-300">
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-[#0c132c]">Verifikasi Pakaian Muslimah</h5>
                  <p className="text-[10px] text-[#46464d] font-semibold">Aktifkan logika verifikasi khusus untuk penggunaan jilbab/kerudung pink.</p>
                </div>
                <div 
                  onClick={() => setHasHijab(!hasHijab)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-200 ${
                    hasHijab ? 'bg-[#0c132c]' : 'bg-[#76767e]'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-200 ${
                    hasHijab ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-[#0c132c] hover:bg-[#212842] hover:opacity-95 text-white font-bold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Mulai Aliran Kamera Pemantau</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </section>

        {/* Right Column: High Fidelity Vector Preview (Col span 5/12) */}
        <section className="col-span-5 bg-white border border-[#D4C9B0] shadow-sm p-6 flex flex-col justify-between select-none">
          <div>
            <h4 className="text-xs font-bold text-[#0c132c] uppercase tracking-wider">Pengaturan Penyelarasan Kalibrasi</h4>
            <p className="text-[11px] text-[#46464d] leading-normal font-semibold mt-1">
              Pastikan mahasiswa berada di posisi tengah jendela bidik kamera tangkapan.
            </p>

            <div className="mt-8 bg-slate-50 border border-[#D4C9B0]/60 p-4 rounded-sm flex items-center justify-center max-h-[180px] overflow-hidden">
              <img 
                src={ASSET_URLS.workstationVector} 
                className="max-h-[140px] opacity-80" 
                alt="Calibration Rig Workflow" 
              />
            </div>
          </div>

          <div className="bg-[#FDFAF5] p-3 border border-dashed border-[#D4C9B0] text-[10px] text-[#46464d] mt-4 leading-normal flex gap-2">
            <InfoIcon className="w-4 h-4 text-[#0c132c] shrink-0" />
            <div>
              <p className="font-bold text-[#0c132c]">Panduan Pemindaian</p>
              <p className="font-semibold mt-0.5">Harap minta mahasiswa untuk menunjukkan kartu identitas pendaftaran mereka dengan jelas ke kamera pemindai agar dapat diverifikasi secara instan.</p>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}

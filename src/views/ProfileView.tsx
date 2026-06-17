/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  User, 
  ShieldAlert, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  Clock, 
  Key, 
  Award, 
  LockKeyhole,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ASSET_URLS } from '../data';
import { AppView } from '../types';

interface ProfileViewProps {
  adminName: string;
  adminRole: string;
  adminDepartment: string;
  adminAvatar: string;
  onNavigate: (view: AppView) => void;
}

export default function ProfileView({ adminName, adminRole, adminDepartment, adminAvatar, onNavigate }: ProfileViewProps) {
  return (
    <div className="flex flex-col gap-6 p-8 bg-[#FDFAF5] overflow-y-auto h-full select-none">
      
      {/* Profile Card Container */}
      <div className="max-w-2xl mx-auto w-full bg-white border border-[#D4C9B0] shadow-xl overflow-hidden relative">
        
        {/* Banner pattern */}
        <div className="h-32 bg-[#0c132c] flex items-end justify-end p-4 relative overflow-hidden">
          {/* Subtle grid layout lines */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#D4C9B0 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
          />
        </div>

        {/* Content Box */}
        <div className="p-8 relative">
          
          {/* Avatar floating overlapping the banner */}
          <div className="absolute -top-16 left-8 w-28 h-28 rounded-full border-4 border-white bg-[#E8DEC8] overflow-hidden shadow-lg shrink-0">
            <img 
              src={adminAvatar || ASSET_URLS.adminAvatar} 
              alt={adminName} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="pt-12 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-[#0c132c] tracking-tight">{adminName}</h2>
              <p className="text-xs font-bold text-[#76767e] uppercase tracking-wide mt-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{adminRole}</span>
              </p>
            </div>

            <button 
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-1 px-3 py-1.5 border border-[#D4C9B0] hover:bg-[#E8DEC8]/50 text-[10px] font-extrabold uppercase tracking-wider text-[#0c132c] transition-all cursor-pointer"
            >
              <span>Ubah Pengaturan</span>
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Details list info grids */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-[#D4C9B0]/60 text-xs font-semibold select-none">
            
            {/* Dept */}
            <div className="p-4 bg-[#FDFAF5] border border-[#D4C9B0]/40 flex gap-3 items-center">
              <Award className="w-5 h-5 text-[#0c132c] shrink-0" />
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[#76767e] block">Departemen / Unit</span>
                <span className="text-[#0c132c] font-bold">{adminDepartment}</span>
              </div>
            </div>

            {/* active status */}
            <div className="p-4 bg-[#FDFAF5] border border-[#D4C9B0]/40 flex gap-3 items-center">
              <Clock className="w-5 h-5 text-emerald-700 shrink-0 select-none animate-pulse" />
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[#76767e] block">Mulai Sesi Aktif</span>
                <span className="text-emerald-800 font-bold">08:00 WIB (Aktif Sekarang)</span>
              </div>
            </div>

          </div>

          {/* Warning notice block regarding credentials safety */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 text-[#0c132c] flex gap-3 items-start select-all">
            <LockKeyhole className="w-5 h-5 text-amber-600 shrink-0 select-none mt-0.5" />
            <div>
              <p className="text-[11px] font-bold tracking-tight text-amber-900 uppercase">Sesi Kerja Terverifikasi</p>
              <p className="text-[10px] text-amber-950 font-semibold mt-1 leading-normal">
                Sesi pendaftaran dan pemantauan kelengkapan atribut mahasiswa baru informatika berjalan pada modul berkeamanan tinggi. Pastikan menjaga kerahasiaan kata sandi administrator Anda.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

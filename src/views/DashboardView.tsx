/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  ArrowRight, 
  UserSquare2, 
  IdCard, 
  Contact, 
  Mail, 
  Eye, 
  Activity,
  UserCheck,
  Building,
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { StudentRecord } from '../types';
import { ASSET_URLS } from '../data';

interface DashboardViewProps {
  students: StudentRecord[];
  onNavigate: (view: string) => void;
  onSelectStudent: (student: StudentRecord) => void;
}

export default function DashboardView({ students, onNavigate, onSelectStudent }: DashboardViewProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'COMPLETE' | 'INCOMPLETE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate statistics
  const totalScans = students.length;
  const completeCount = students.filter(s => s.status === 'COMPLETE').length;
  const incompleteCount = students.filter(s => s.status === 'INCOMPLETE').length;
  const completionRate = totalScans ? Math.round((completeCount / totalScans) * 100) : 0;

  // Filter students based on selection & search query
  const filteredStudents = students.filter(student => {
    // Search match
    const matchesSearch = student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Status match
    if (filterType === 'ALL') return true;
    return student.status === filterType;
  });

  return (
    <div className="flex flex-col gap-6 p-8 bg-[#FDFAF5] overflow-y-auto h-full select-none">
      
      {/* 1. Statistics Cards Block */}
      <section className="grid grid-cols-4 gap-4">
        
        {/* Total scans Card */}
        <div className="bg-white border border-[#D4C9B0] p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#76767e]">Total Catatan Pindai</p>
              <h3 className="text-3xl font-bold text-[#0c132c] mt-2 font-mono">{totalScans}</h3>
            </div>
            <div className="p-2.5 bg-[#E8DEC8] text-[#0c132c] shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[#46464d] gap-2">
            <span>Daftar Mahasiswa Aktif</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] shrink-0">
              Cocok 100% dengan database
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0c132c] transition-all duration-300 group-hover:bg-[#3f4661]" />
        </div>

        {/* Complete uniforms Card */}
        <div className="bg-white border border-[#D4C9B0] p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#76767e]">Atribut Lengkap</p>
              <h3 className="text-3xl font-bold text-emerald-800 mt-2 font-mono">{completeCount}</h3>
            </div>
            <div className="p-2.5 bg-emerald-100 text-emerald-800 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[#46464d]">
            <span>Semua atribut terverifikasi</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              +{Math.round((completeCount/totalScans)*100)}%
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-600" />
        </div>

        {/* Incomplete uniform Card */}
        <div className="bg-white border border-[#D4C9B0] p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#76767e]">Atribut Tidak Lengkap</p>
              <h3 className="text-3xl font-bold text-[#ba1a1a] mt-2 font-mono">{incompleteCount}</h3>
            </div>
            <div className="p-2.5 bg-red-50 text-[#ba1a1a] shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[#46464d]">
            <span>Perlu pengiriman notifikasi</span>
            <span className="text-[#ba1a1a] font-bold bg-red-50 px-1.5 py-0.5 rounded">
              {Math.round((incompleteCount/totalScans)*100)}% pelanggaran
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#ba1a1a]" />
        </div>

        {/* Progress gauge card */}
        <div className="bg-white border border-[#D4C9B0] p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#76767e]">Indikator Kepatuhan Harian</p>
              <h3 className="text-3xl font-bold text-[#0c132c] mt-2 font-mono">{completionRate}%</h3>
            </div>
            <div className="p-2.5 bg-[#dbe2fc] text-[#0a1b4d] shrink-0">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="w-full h-2 bg-[#f0edf0] rounded-sm overflow-hidden">
              <div 
                className="h-full bg-[#0a1b4d] transition-all duration-500" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#76767e]">
              <span>Skor kepatuhan keseluruhan</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-500" />
        </div>

      </section>

      {/* 2. Main content split dashboard topology */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Recent Detections List (Col span 7/12) */}
        <div className="col-span-7 bg-white border border-[#D4C9B0] shadow-sm flex flex-col justify-between">
          <div>
            <header className="p-5 border-b border-[#D4C9B0]/60 flex items-center justify-between">
              <div>
                <h4 className="font-sans text-sm font-bold text-[#0c132c] tracking-tight">Daftar Hasil Pemindaian Terbaru</h4>
                <p className="text-[11px] text-[#76767e] mt-1 font-semibold">Pembaruan status waktu nyata dari kepatuhan atribut mahasiswa.</p>
              </div>

              {/* Status query tabs */}
              <div className="flex bg-[#E8DEC8]/50 border border-[#D4C9B0]/60 p-0.5">
                {(['ALL', 'COMPLETE', 'INCOMPLETE'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterType(tab)}
                    className={`px-3 py-1 text-[10px] uppercase font-bold transition-all cursor-pointer ${
                      filterType === tab 
                        ? 'bg-[#0c132c] text-white' 
                        : 'text-[#46464d] hover:bg-white/50'
                    }`}
                  >
                    {tab === 'ALL' ? 'Semua' : tab === 'COMPLETE' ? 'Lengkap' : 'Belum Lengkap'}
                  </button>
                ))}
              </div>
            </header>

            {/* search filter row */}
            <div className="px-5 py-3 bg-[#FDFAF5] border-b border-[#D4C9B0]/40 flex gap-2">
              <div className="relative flex-grow">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan nama, nim atau email..."
                  className="w-full bg-white border border-[#D4C9B0] pl-8 pr-3 py-1.5 text-xs text-[#0c132c] outline-none font-medium placeholder:text-[#76767e]"
                />
                <Search className="absolute left-2.5 top-1/2 -get-middle -translate-y-1/2 w-4 h-4 text-[#76767e]" />
              </div>
            </div>

            {/* Scan rows container */}
            <div className="divide-y divide-[#D4C9B0]/40 overflow-y-auto max-h-[320px]">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <div 
                    key={student.id}
                    onClick={() => onSelectStudent(student)}
                    className="p-4 flex items-center justify-between hover:bg-[#FDFAF5]/60 active:bg-[#f0edf0]/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full border border-[#D4C9B0] overflow-hidden bg-white shrink-0 shadow-sm relative">
                        <img 
                          src={student.profileUrl} 
                          alt={student.fullName} 
                          className="w-full h-full object-cover"
                        />
                        {student.gender === 'Female' && student.hasHijab && (
                          <span className="absolute bottom-0 right-0 bg-[#ba1a1a] w-2.5 h-2.5 rounded-full border border-white" title="Hijab Registered" />
                        )}
                      </div>

                      {/* Info labels */}
                      <div>
                        <h5 className="text-xs font-bold text-[#0c132c] group-hover:underline">{student.fullName}</h5>
                        <p className="text-[10px] text-[#76767e] font-semibold mt-0.5">{student.userId} • {student.email}</p>
                        
                        {/* Attributes Checklist Indicators */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-2 mt-1.5">
                          {student.gender === 'Female' ? (
                            <>
                              <div className="flex items-center gap-1 bg-pink-50/50 px-1 border border-pink-100 rounded-[2px]">
                                <span className={`w-1.5 h-1.5 rounded-full ${student.hasNametag ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-[8px] text-[#46464d] font-bold uppercase tracking-normal">Nametag</span>
                              </div>
                              <div className="flex items-center gap-1 bg-pink-50/50 px-1 border border-pink-100 rounded-[2px]" title="Kerudung Pink">
                                <span className={`w-1.5 h-1.5 rounded-full ${student.hasKerudungPink ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-[8px] text-[#46464d] font-bold uppercase tracking-normal">Krd. Pink</span>
                              </div>
                              <div className="flex items-center gap-1 bg-pink-50/50 px-1 border border-pink-100 rounded-[2px]">
                                <span className={`w-1.5 h-1.5 rounded-full ${student.hasKemejaPutih ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-[8px] text-[#46464d] font-bold uppercase tracking-normal">Kmj. Putih</span>
                              </div>
                              <div className="flex items-center gap-1 bg-pink-50/50 px-1 border border-pink-100 rounded-[2px]">
                                <span className={`w-1.5 h-1.5 rounded-full ${student.hasRokHitam ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-[8px] text-[#46464d] font-bold uppercase tracking-normal">Rok Hitam</span>
                              </div>
                              <div className="flex items-center gap-1 bg-pink-50/50 px-1 border border-pink-100 rounded-[2px]">
                                <span className={`w-1.5 h-1.5 rounded-full ${student.hasSabuk ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-[8px] text-[#46464d] font-bold uppercase tracking-normal">Sabuk</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-1 bg-slate-50 px-1 border border-slate-200 rounded-[2px]">
                                <span className={`w-1.5 h-1.5 rounded-full ${student.hasNametag ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-[8px] text-[#46464d] font-bold uppercase tracking-normal">Nametag</span>
                              </div>
                              <div className="flex items-center gap-1 bg-slate-50 px-1 border border-slate-200 rounded-[2px]">
                                <span className={`w-1.5 h-1.5 rounded-full ${student.hasKemejaPutih ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-[8px] text-[#46464d] font-bold uppercase tracking-normal">Kmj. Putih</span>
                              </div>
                              <div className="flex items-center gap-1 bg-slate-50 px-1 border border-slate-200 rounded-[2px]">
                                <span className={`w-1.5 h-1.5 rounded-full ${student.hasCelanaHitam ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-[8px] text-[#46464d] font-bold uppercase tracking-normal">Cln. Hitam</span>
                              </div>
                              <div className="flex items-center gap-1 bg-slate-50 px-1 border border-slate-200 rounded-[2px]">
                                <span className={`w-1.5 h-1.5 rounded-full ${student.hasSabuk ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-[8px] text-[#46464d] font-bold uppercase tracking-normal">Sabuk</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right elements: Status label badge */}
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                        student.status === 'COMPLETE' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-400/40' 
                          : 'bg-red-50 text-[#ba1a1a] border border-[#ba1a1a]/30 animate-pulse'
                      }`}>
                        {student.status === 'COMPLETE' ? 'Lengkap' : 'Belum Lengkap'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#76767e] transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-xs text-[#76767e] font-semibold">Tidak ada data mahasiswa terpindai yang cocok dengan pencarian.</p>
                </div>
              )}
            </div>
          </div>

          {/* Table footer action */}
          <footer className="p-3 border-t border-[#D4C9B0]/60 bg-[#FDFAF5] flex justify-between items-center text-xs">
            <span className="font-semibold text-[#46464d]">Menampilkan {filteredStudents.length} dari {totalScans} entri</span>
            <button 
              onClick={() => onNavigate('history')}
              className="text-[#0c132c] font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Lihat semua riwayat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </footer>
        </div>

        {/* Right Column: Dynamic Scanning Station Panel & Vector Topology (Col span 5/12) */}
        <div className="col-span-5 flex flex-col gap-5">
          
          {/* Quick Launcher controller card */}
          <div className="bg-[#0c132c] hover:bg-[#121b3a] p-6 border border-[#212842] shadow-md text-white transition-all group flex flex-col h-1/2 justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div className="bg-[#3f4661] p-3 rounded text-white shrink-0">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[9px] font-bold tracking-widest text-white/50 uppercase border border-white/20 px-2 py-0.5">
                  Sistem Pemindai Aktif
                </span>
              </div>
              
              <h4 className="font-sans text-base font-bold text-white mt-4 tracking-tight leading-tight">
                Pemindai Inspeksi Atribut
              </h4>
              <p className="text-xs text-[#888fae] mt-1.5 leading-normal">
                Mulai modul kamera untuk memverifikasi kartu identitas mahasiswa, kepatuhan kerudung, dan kesesuaian atribut pakaian akademik secara instan.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => onNavigate('detection-input')}
                className="w-full bg-[#3f4661] hover:bg-[#626e95] text-white font-bold py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-inner transition-colors duration-200 cursor-pointer"
              >
                <span>Mulai Unit Pemindai</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick action dispatch email card */}
          <div className="bg-white p-6 border border-[#D4C9B0] shadow-sm flex flex-col h-1/2 justify-between">
            <div className="flex gap-4">
              <div className="p-3 bg-red-100/50 border border-red-200 text-[#ba1a1a] shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#0c132c]">
                  Pengiriman Surat Peringatan
                </h4>
                <p className="text-[11px] text-[#46464d] leading-normal mt-1 font-semibold">
                  Buat draf pesan dan kirimkan peringatan atribut yang tidak lengkap ke akun mahasiswa secara otomatis.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => onNavigate('notifications')}
                className="w-full bg-[#f0edf0]/80 border border-[#D4C9B0] text-[#0c132c] hover:bg-[#E8DEC8]/50 font-bold py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Tulis Peringatan</span>
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

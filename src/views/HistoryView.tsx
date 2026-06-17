/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Mail, 
  Download, 
  Filter, 
  Check, 
  X, 
  AlertTriangle,
  Info,
  SlidersHorizontal,
  ChevronRight,
  Printer,
  XSquare
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { StudentRecord } from '../types';

interface HistoryViewProps {
  students: StudentRecord[];
  onDeleteRecord: (id: string) => void;
  onSendNotification: (student: StudentRecord) => void;
}

export default function HistoryView({ students, onDeleteRecord, onSendNotification }: HistoryViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETE' | 'INCOMPLETE'>('ALL');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'Male' | 'Female'>('ALL');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter computation
  const filtered = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          student.userId.toLowerCase().includes(search.toLowerCase()) ||
                          student.email.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    if (statusFilter !== 'ALL' && student.status !== statusFilter) return false;
    if (genderFilter !== 'ALL' && student.gender !== genderFilter) return false;

    return true;
  });

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // 1. Top Header Banner
    doc.setFillColor(12, 19, 44); // #0c132c Navy color
    doc.rect(0, 0, 297, 28, 'F');

    doc.setTextColor(253, 250, 245); // Warm bone #FDFAF5
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('RIWAYAT REGISTER PEMERIKSAAN ATRIBUT SIPMA', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Laporan Otomatis Pemantauan Kepatuhan Atribut Seragam Mahasiswa', 14, 18);
    doc.text(`Waktu Cetak Laporan: ${new Date().toLocaleString()}`, 14, 22);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Total Catatan: ${students.length}`, 240, 15);

    // 2. Table Column Headers
    let y = 38;
    doc.setFillColor(232, 222, 200); // Warm gold #E8DEC8
    doc.rect(10, y, 277, 9, 'F');

    doc.setTextColor(12, 19, 44);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
    doc.text('Nama Lengkap', 14, y + 6);
    doc.text('NIM / Kode', 65, y + 6);
    doc.text('Gender', 100, y + 6);
    doc.text('Waktu Sesi', 125, y + 6);
    doc.text('Status Parameter Atribut (Papan Nama | Kemeja Putih | Sabuk | Pakaian)', 158, y + 6);
    doc.text('Status', 265, y + 6);

    // 3. Grid Rows
    y += 9;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(27, 27, 29);

    students.forEach((s, idx) => {
      // Pagination split handler
      if (y > 185) {
        doc.addPage();
        
        // Draw Header on new page
        doc.setFillColor(12, 19, 44);
        doc.rect(0, 0, 297, 28, 'F');
        
        doc.setTextColor(253, 250, 245);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('RIWAYAT REGISTER PEMERIKSAAN ATRIBUT SIPMA', 14, 12);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text('Laporan Otomatis Pemantauan Kepatuhan Atribut Seragam Mahasiswa', 14, 18);
        doc.text(`Halaman: ${doc.getNumberOfPages()}`, 255, 12);

        y = 38;
        doc.setFillColor(232, 222, 200);
        doc.rect(10, y, 277, 9, 'F');

        doc.setTextColor(12, 19, 44);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        
        doc.text('Nama Lengkap', 14, y + 6);
        doc.text('NIM / Kode', 65, y + 6);
        doc.text('Gender', 100, y + 6);
        doc.text('Waktu Sesi', 125, y + 6);
        doc.text('Status Parameter Atribut (Papan Nama | Kemeja Putih | Sabuk | Pakaian)', 158, y + 6);
        doc.text('Status', 265, y + 6);

        y += 9;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(27, 27, 29);
      }

      // Zebra striping bg
      if (idx % 2 === 1) {
        doc.setFillColor(253, 250, 245); // #FDFAF5
        doc.rect(10, y, 277, 10, 'F');
      }

      // Border bottom
      doc.setDrawColor(212, 201, 176); // #D4C9B0
      doc.line(10, y + 10, 287, y + 10);

      // Student demographic Info
      doc.setTextColor(12, 19, 44);
      doc.setFont('helvetica', 'bold');
      doc.text(s.fullName, 14, y + 6.5);
      
      doc.setTextColor(27, 27, 29);
      doc.setFont('helvetica', 'normal');
      doc.text(s.userId, 65, y + 6.5);
      doc.text(s.gender === 'Female' ? 'Perempuan' : 'Laki-laki', 100, y + 6.5);
      doc.text(s.timestamp, 125, y + 6.5);

      // Render Checkmarks
      let checks = '';
      if (s.gender === 'Female') {
        checks = [
          `PapanNama: ${s.hasNametag ? 'ADA' : 'TIDAK'}`,
          `KemejaPutih: ${s.hasKemejaPutih ? 'ADA' : 'TIDAK'}`,
          `Sabuk: ${s.hasSabuk ? 'ADA' : 'TIDAK'}`,
          `KrdPink: ${s.hasKerudungPink ? 'ADA' : 'TIDAK'}`,
          `RokHitam: ${s.hasRokHitam ? 'ADA' : 'TIDAK'}`
        ].join(' | ');
      } else {
        checks = [
          `PapanNama: ${s.hasNametag ? 'ADA' : 'TIDAK'}`,
          `KemejaPutih: ${s.hasKemejaPutih ? 'ADA' : 'TIDAK'}`,
          `Sabuk: ${s.hasSabuk ? 'ADA' : 'TIDAK'}`,
          `CelanaHitam: ${s.hasCelanaHitam ? 'ADA' : 'TIDAK'}`
        ].join(' | ');
      }
      doc.setFontSize(8);
      doc.text(checks, 158, y + 6.5);
      doc.setFontSize(8.5);

      // Status text coloring
      if (s.status === 'COMPLETE') {
        doc.setTextColor(16, 124, 65); // Green
        doc.setFont('helvetica', 'bold');
        doc.text('LENGKAP', 265, y + 6.5);
      } else {
        doc.setTextColor(186, 26, 26); // Red
        doc.setFont('helvetica', 'bold');
        doc.text('TDK LENGKAP', 265, y + 6.5);
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(27, 27, 29);

      y += 10;
    });

    // Save report
    doc.save(`laporan_register_sipma_${new Date().toISOString().substring(0, 10)}.pdf`);
  };

  const handlePrintMock = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 p-8 bg-[#FDFAF5] overflow-y-auto h-full select-none">
      
      {/* Upper Action Banner - Print and PDF exports */}
      <section className="flex justify-between items-center bg-white border border-[#D4C9B0] p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E8DEC8] text-[#0c132c] flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0c132c]">Riwayat Register Pemindaian</h3>
            <p className="text-xs text-[#76767e] font-semibold mt-0.5">Kelola, ekspor, dan hapus data log pemeriksaan atribut mahasiswa.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-[#D4C9B0] bg-white text-xs font-bold uppercase tracking-wider text-[#0c132c] hover:bg-[#E8DEC8]/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor laporan PDF</span>
          </button>
          <button
            onClick={handlePrintMock}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-[#0c132c] bg-[#0c132c] text-xs font-bold uppercase tracking-wider text-white hover:bg-[#212842] transition-all cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </section>

      {/* Grid: Main logs list */}
      <div className="grid grid-cols-12 gap-6">

        {/* Filters control & Student logs list (Col span 12) */}
        <section className="col-span-12 bg-white border border-[#D4C9B0] shadow-sm overflow-hidden flex flex-col justify-between min-h-[440px]">
          <div>
            
            {/* Filters Row */}
            <div className="p-4 bg-[#E8DEC8]/30 border-b border-[#D4C9B0]/60 flex flex-wrap gap-4 items-center justify-between text-xs font-bold">
              
              {/* Search */}
              <div className="relative w-64">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama mahasiswa atau NIM..."
                  className="w-full bg-white border border-[#D4C9B0] pl-8 pr-3 py-1.5 text-xs text-[#0c132c] outline-none font-medium"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#76767e]" />
              </div>

              {/* Status Filter buttons */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#76767e] uppercase tracking-wider">Status:</span>
                <div className="flex border border-[#D4C9B0] bg-white">
                  {(['ALL', 'COMPLETE', 'INCOMPLETE'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-3 py-1 text-[10px] uppercase font-bold transition-all cursor-pointer ${
                        statusFilter === tab 
                          ? 'bg-[#0c132c] text-white' 
                          : 'text-[#46464d] hover:bg-gray-100'
                      }`}
                    >
                      {tab === 'ALL' ? 'Semua' : tab === 'COMPLETE' ? 'Sesuai' : 'Tidak Sesuai'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Filter buttons */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#76767e] uppercase tracking-wider">Gender:</span>
                <div className="flex border border-[#D4C9B0] bg-white">
                  {(['ALL', 'Male', 'Female'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setGenderFilter(tab)}
                      className={`px-3 py-1 text-[10px] uppercase font-bold transition-all cursor-pointer ${
                        genderFilter === tab 
                          ? 'bg-[#0c132c] text-white' 
                          : 'text-[#46464d] hover:bg-gray-100'
                      }`}
                    >
                      {tab === 'ALL' ? 'Semua' : tab === 'Male' ? 'Laki-laki' : 'Perempuan'}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Table layout logs list */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="bg-[#FDFAF5] border-b border-[#D4C9B0]/60 text-[10px] font-bold uppercase tracking-wider text-[#76767e]">
                    <th className="p-4">Mahasiswa</th>
                    <th className="p-4">NIM</th>
                    <th className="p-4">Jenis Kelamin & Hijab</th>
                    <th className="p-4">Waktu Inspeksi</th>
                    <th className="p-4">Status Parameter Atribut</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4C9B0]/30 text-xs font-semibold">
                  {filtered.length > 0 ? (
                    filtered.map((student) => (
                      <tr key={student.id} className="hover:bg-[#FDFAF5]/40 transition-colors">
                        {/* Target Student Column */}
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full border border-[#D4C9B0] overflow-hidden bg-white shrink-0">
                              <img src={student.profileUrl} alt={student.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <h5 className="font-bold text-[#0c132c]">{student.fullName}</h5>
                              <p className="text-[10px] text-[#76767e] font-medium mt-0.5">{student.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* ID Column */}
                        <td className="p-3 text-[#0c132c] font-mono leading-none select-all">{student.userId}</td>

                        {/* Gender column */}
                        <td className="p-3 text-[#46464d]">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold">{student.gender === 'Female' ? 'Perempuan' : 'Laki-laki'}</span>
                            {student.gender === 'Female' && (
                              <span className="text-[9px] font-bold p-0.5 px-1.5 uppercase tracking-wide inline-block leading-none bg-pink-50 text-pink-700 border border-pink-100">
                                Hijab Pink Resmi
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Timestamp */}
                        <td className="p-3 text-[#46464d] font-semibold">{student.timestamp}</td>

                        {/* Compliance checks checklist column */}
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-[320px]">
                            {student.gender === 'Female' ? (
                              <>
                                <span className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-[2px] border ${
                                  student.hasNametag 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300/50' 
                                    : 'bg-red-50 text-[#ba1a1a] border-[#ba1a1a]/30'
                                }`}>
                                  Papan Nama
                                </span>
                                <span className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-[2px] border ${
                                  student.hasKerudungPink 
                                    ? 'bg-pink-50 text-pink-700 border-pink-300/40' 
                                    : 'bg-red-50 text-[#ba1a1a] border-[#ba1a1a]/30'
                                }`}>
                                  Krd. Pink
                                </span>
                                <span className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-[2px] border ${
                                  student.hasKemejaPutih 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300/50' 
                                    : 'bg-red-50 text-[#ba1a1a] border-[#ba1a1a]/30'
                                }`}>
                                  Kmj. Putih
                                </span>
                                <span className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-[2px] border ${
                                  student.hasRokHitam 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300/50' 
                                    : 'bg-red-50 text-[#ba1a1a] border-[#ba1a1a]/30'
                                }`}>
                                  Rok Hitam
                                </span>
                                <span className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-[2px] border ${
                                  student.hasSabuk 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300/50' 
                                    : 'bg-red-50 text-[#ba1a1a] border-[#ba1a1a]/30'
                                }`}>
                                  Sabuk
                                </span>
                              </>
                            ) : (
                              <>
                                <span className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-[2px] border ${
                                  student.hasNametag 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300/50' 
                                    : 'bg-red-50 text-[#ba1a1a] border-[#ba1a1a]/30'
                                }`}>
                                  Papan Nama
                                </span>
                                <span className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-[2px] border ${
                                  student.hasKemejaPutih 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300/50' 
                                    : 'bg-red-50 text-[#ba1a1a] border-[#ba1a1a]/30'
                                }`}>
                                  Kmj. Putih
                                </span>
                                <span className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-[2px] border ${
                                  student.hasCelanaHitam 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300/50' 
                                    : 'bg-red-50 text-[#ba1a1a] border-[#ba1a1a]/30'
                                }`}>
                                  Cln. Hitam
                                </span>
                                <span className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-[2px] border ${
                                  student.hasSabuk 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300/50' 
                                    : 'bg-red-50 text-[#ba1a1a] border-[#ba1a1a]/30'
                                }`}>
                                  Sabuk
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide inline-block leading-none ${
                            student.status === 'COMPLETE' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-400/40' 
                              : 'bg-red-50 text-[#ba1a1a] border border-[#ba1a1a]/30'
                          }`}>
                            {student.status === 'COMPLETE' ? 'LENGKAP' : 'TDK LENGKAP'}
                          </span>
                        </td>

                        {/* Action buttons (Email draft warning, trash etc) */}
                        <td className="p-3 text-right">
                          {confirmDeleteId === student.id ? (
                            <div className="flex justify-end gap-1.5 transition-all">
                              <button 
                                onClick={() => {
                                  onDeleteRecord(student.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-1 bg-red-600 text-white text-[10px] font-extrabold uppercase hover:opacity-90 cursor-pointer"
                              >
                                Ya, Hapus
                              </button>
                              <button 
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 bg-gray-200 text-[#46464d] text-[10px] font-extrabold uppercase cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end items-center gap-1.5">
                              {student.status === 'INCOMPLETE' && (
                                <button
                                  onClick={() => onSendNotification(student)}
                                  className="p-1.5 border border-[#ba1a1a]/30 text-[#ba1a1a] hover:bg-red-100/30 rounded cursor-pointer"
                                  title="Kirim draf peringatan pelanggaran atribut"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => setConfirmDeleteId(student.id)}
                                className="p-1.5 border border-[#D4C9B0] text-[#76767e] hover:text-[#ba1a1a] hover:bg-gray-100 rounded cursor-pointer"
                                title="Hapus catatan riwayat pemindaian ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-sm font-semibold text-[#76767e]">
                        Tidak ada riwayat pemindaian atribut yang cocok dengan parameter filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Table display statistics details */}
          <footer className="p-4 border-t border-[#D4C9B0]/60 bg-[#FDFAF5] flex justify-between items-center text-xs font-semibold">
            <span className="text-[#46464d]">Semua data register pemindaian disimpan secara lokal di dalam sistem browser Anda.</span>
            <span className="text-[#0c132c]">Menampilkan {filtered.length} catatan</span>
          </footer>

        </section>

      </div>

    </div>
  );
}

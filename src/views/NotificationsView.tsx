/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Database, 
  Trash2, 
  HelpCircle,
  HelpCircle as QuestionIcon,
  ChevronRight,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';
import { NotificationLog, StudentRecord } from '../types';

interface NotificationsViewProps {
  logs: NotificationLog[];
  presetTarget: StudentRecord | null;
  onSendMail: (newLog: NotificationLog) => void;
  onClearPreset: () => void;
  students: StudentRecord[];
}

export default function NotificationsView({ logs, presetTarget, onSendMail, onClearPreset, students }: NotificationsViewProps) {
  const incompleteStudents = (students || []).filter(s => s.status === 'INCOMPLETE');

  const [recipient, setRecipient] = useState('');
  const [alertType, setAlertType] = useState('Peringatan Atribut 1');
  const [status, setStatus] = useState<'SENT' | 'FAILED'>('SENT');
  const [message, setMessage] = useState('');
  const [activeStudent, setActiveStudent] = useState<StudentRecord | null>(presetTarget);

  const getMissingItems = (student: StudentRecord) => {
    const itemsArr = [];
    if (!student.hasNametag) itemsArr.push("Papan Nama Mahasiswa");
    if (!student.hasKemejaPutih) itemsArr.push("Kemeja Putih");
    if (!student.hasSabuk) itemsArr.push("Sabuk Akademik");
    if (student.gender === 'Female') {
      if (!student.hasKerudungPink) itemsArr.push("Kerudung Pink");
      if (!student.hasRokHitam) itemsArr.push("Rok Hitam");
    } else {
      if (!student.hasCelanaHitam) itemsArr.push("Celana Hitam");
    }
    return itemsArr.join(", ");
  };

  const updateTemplateText = (type: string, studentName?: string, issueString?: string) => {
    const name = studentName || 'Mahasiswa Baru';
    const issues = issueString ? `\n\nAtribut yang tidak lengkap/tidak terdeteksi:\n- ${issueString}` : '';

    switch (type) {
      case 'Peringatan Atribut 1':
        setMessage(`Yth. ${name},

Stasiun pemindaian otomatis SIPMA mencatat bahwa kelengkapan atribut seragam akademik Anda belum lengkap (Peringatan Atribut 1).${issues}

Mohon untuk segera melengkapi atribut wajib tersebut sesuai dengan tata tertib akademik mahasiswa baru yang berlaku sebelum memasuki gerbang kampus.

Salam hangat,
Komite SIPMA`);
        break;
      case 'Peringatan Atribut 2':
        setMessage(`Yth. ${name},

Ini adalah surat Peringatan Atribut 2 mengenai ketidaklengkapan atribut wajib berpakaian Anda yang kembali terdeteksi oleh sistem pemindaian otomatis SIPMA.${issues}

Harap segera melengkapi atribut seragam Anda demi kenyamanan bersama. Jika pelanggaran ini berlanjut, Anda akan diminta untuk melakukan verifikasi disiplin secara manual di kantor komite.

Salam hangat,
Komite SIPMA`);
        break;
      case 'Peringatan Terakhir':
        setMessage(`Yth. ${name},

Ini adalah PERINGATAN TERAKHIR yang diterbitkan oleh sistem administrasi SIPMA untuk ketidaklengkapan atribut pakaian wajib Anda.${issues}

Kelalaian yang berkelanjutan ini merupakan bentuk pelanggaran aturan tata tertib akademik. Jika atribut di atas tidak segera dilengkapi pada sesi pemindaian berikutnya, laporan pelanggaran disiplin ini akan secara resmi diteruskan langsung ke Pembina Akademik dan Komite Disiplin Jurusan.

Salam tegas,
Komite SIPMA`);
        break;
      default:
        setMessage('Pemberitahuan kustom.');
    }
  };

  // Sync state when presetTarget or student list changes
  useEffect(() => {
    if (presetTarget) {
      setActiveStudent(presetTarget);
      setRecipient(presetTarget.email);
    } else if (incompleteStudents.length > 0 && !activeStudent) {
      setActiveStudent(incompleteStudents[0]);
      setRecipient(incompleteStudents[0].email);
    }
  }, [presetTarget, students]);

  // Sync draft message whenever activeStudent or alertType changes
  useEffect(() => {
    if (activeStudent) {
      const issues = getMissingItems(activeStudent);
      updateTemplateText(alertType, activeStudent.fullName, issues);
    } else {
      updateTemplateText(alertType);
    }
  }, [activeStudent, alertType]);

  const handleAlertChange = (type: string) => {
    setAlertType(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !message.trim()) {
      alert('Pemberitahuan: email penerima dan pesan tidak boleh kosong.');
      return;
    }

    const newLog: NotificationLog = {
      recipient,
      type: alertType,
      status,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onSendMail(newLog);
    
    // Clear preset after dispatch
    if (presetTarget) {
      onClearPreset();
    }
  };

  // Math analytics helper
  const successLogsCount = logs.filter(l => l.status === 'SENT').length;
  const deliverySuccessRate = logs.length ? Math.round((successLogsCount / logs.length) * 100) : 100;

  return (
    <div className="flex flex-col gap-6 p-8 bg-[#FDFAF5] overflow-y-auto h-full select-none">
      
      {/* 1. Header descriptive card */}
      {presetTarget && (
        <div className="bg-[#ba1a1a]/10 border-2 border-[#ba1a1a]/40 p-4 flex gap-4 items-center justify-between animate-pulse">
          <div className="flex gap-3 items-center">
            <Mail className="w-5 h-5 text-[#ba1a1a]" />
            <div>
              <h4 className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wider">Preset Draf Peringatan Dimuat</h4>
              <p className="text-[11px] text-[#46464d] font-semibold mt-0.5">
                Menyusun draft peringatan kepatuhan untuk mahasiswa: <span className="font-bold text-[#0c132c]">{presetTarget.fullName}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClearPreset}
            className="text-[10px] uppercase font-bold px-2 py-1 bg-white border border-[#ba1a1a] text-[#ba1a1a] cursor-pointer"
          >
            Hapus preset custom
          </button>
        </div>
      )}

      {/* 2. Main split grids */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left column: Template Composer Form */}
        <section className="col-span-6 bg-white border border-[#D4C9B0] p-6 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-4">
            <header className="border-b border-[#D4C9B0]/60 pb-3">
              <span className="text-[9px] font-bold tracking-widest text-[#0c132c] bg-[#E8DEC8] px-2 py-0.5 uppercase">
                Mesin Email SIPMA
              </span>
              <h3 className="text-sm font-bold text-[#0c132c] tracking-tight mt-1.5">Unit Penyusun Template Peringatan</h3>
            </header>

            {/* Recipient selection list (Only allows Incomplete freshmen) */}
            <div className="space-y-1.5">
              <label id="recipient-dropdown-label" className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">
                Email Penerima (Mahasiswa dengan Atribut Belum Lengkap)
              </label>
              <select
                value={recipient}
                onChange={(e) => {
                  const selectedEmail = e.target.value;
                  setRecipient(selectedEmail);
                  const foundStudent = incompleteStudents.find(s => s.email === selectedEmail);
                  if (foundStudent) {
                    setActiveStudent(foundStudent);
                  } else {
                    setActiveStudent(null);
                  }
                }}
                className="w-full bg-white border border-[#D4C9B0] px-3.5 py-2 text-xs font-bold text-[#0c132c] outline-none"
              >
                {incompleteStudents.length === 0 ? (
                  <option value="">Tidak ada mahasiswa dengan atribut tidak lengkap</option>
                ) : (
                  <>
                    <option value="">-- Pilih Mahasiswa Baru --</option>
                    {incompleteStudents.map(student => (
                      <option key={student.id} value={student.email}>
                        {student.fullName} - {student.userId} ({student.email})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Alert Category */}
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block font-sans">
                  Kategori Peringatan
                </label>
                <select
                  value={alertType}
                  onChange={(e) => handleAlertChange(e.target.value)}
                  className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-bold text-[#0c132c] outline-none"
                >
                  <option value="Peringatan Atribut 1">Peringatan Atribut 1</option>
                  <option value="Peringatan Atribut 2">Peringatan Atribut 2</option>
                  <option value="Peringatan Terakhir">Peringatan Terakhir</option>
                </select>
              </div>

              {/* Status flag simulator */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Status Simulator</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'SENT' | 'FAILED')}
                  className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-bold text-[#0c132c] outline-none"
                >
                  <option value="SENT">SENT (Terkirim Sukses)</option>
                  <option value="FAILED">FAILED (SMTP Gagal)</option>
                </select>
              </div>
            </div>

            {/* Message block */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Isi Pesan Email Warning</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-medium text-[#0c132c] focus:outline-none font-mono leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#0c132c] hover:bg-[#212842] text-white font-bold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Surat Peringatan</span>
              </button>
            </div>
          </form>
        </section>

        {/* Right column: Outbox logs list */}
        <section className="col-span-6 bg-white border border-[#D4C9B0] shadow-sm flex flex-col justify-between">
          <div>
            <header className="p-5 border-b border-[#D4C9B0]/60 flex items-center justify-between">
              <div>
                <h4 className="font-sans text-sm font-bold text-[#0c132c]">Log Email Keluar Terkirim</h4>
                <p className="text-[10px] text-[#76767e] mt-1 font-semibold">Rekaman data pengiriman SMTP akademis.</p>
              </div>

              {/* Success Rate metrics badge */}
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#0c132c] block">KEMAMPUAN KIRIM SMTP</span>
                <span className="text-xs font-mono font-bold text-emerald-800">{deliverySuccessRate}% Sukses</span>
              </div>
            </header>

            {/* Outbox rows list */}
            <div className="divide-y divide-[#D4C9B0]/40 overflow-y-auto max-h-[350px]">
              {logs.map((log, index) => {
                const isSent = log.status === 'SENT';
                return (
                  <div key={index} className="p-3.5 flex items-center justify-between hover:bg-[#FDFAF5]/50 transition-colors select-none">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${isSent ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-[#ba1a1a]'}`}>
                        {isSent ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      
                      <div>
                        <h5 className="text-[11px] font-bold text-[#0c132c]">{log.recipient}</h5>
                        <div className="flex gap-1.5 items-center mt-0.5">
                          <span className="text-[9px] font-bold text-[#76767e] uppercase tracking-wider">
                            {log.type}
                          </span>
                          <span className="text-[9px] text-gray-300 font-bold">•</span>
                          <span className="text-[9px] text-[#76767e] font-semibold">{log.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest ${
                        isSent 
                          ? 'bg-emerald-50 text-[#0c6b44] border border-emerald-300/40' 
                          : 'bg-red-50 text-[#ba1a1a] border border-[#ba1a1a]/30 animate-pulse'
                      }`}>
                        {isSent ? 'TERKIRIM' : 'GAGAL'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outbox count footer */}
          <footer className="p-3 bg-[#FDFAF5] border-t border-[#D4C9B0]/60 text-[10px] font-semibold text-[#46464d] flex justify-between items-center">
            <span>Antrean terkirim: {logs.length} catatan</span>
            <span className="text-[#0c132c] font-bold">Antrean Email Aman</span>
          </footer>
        </section>

      </div>

    </div>
  );
}

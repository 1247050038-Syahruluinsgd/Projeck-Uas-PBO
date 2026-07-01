/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Phone,
  Send,
  CheckCircle,
  AlertCircle,
  Trash2,
  Loader2,
  WifiOff,
  Zap,
  User,
  TrendingUp,
} from 'lucide-react';
import { NotificationLog, StudentRecord } from '../types';
import { sendWhatsAppNotification, fetchNotificationLogs } from '../api/notificationsApi';

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
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [supabaseLogs, setSupabaseLogs] = useState<NotificationLog[]>(logs);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Muat log dari Supabase saat pertama kali dibuka
  useEffect(() => {
    setIsLoadingLogs(true);
    fetchNotificationLogs().then(fetched => {
      if (fetched.length > 0) setSupabaseLogs(fetched);
      else setSupabaseLogs(logs);
    }).finally(() => setIsLoadingLogs(false));
  }, []);

  // Sync jika logs prop berubah (auto-notify dari App.tsx)
  useEffect(() => {
    if (logs.length > (supabaseLogs.length)) {
      setSupabaseLogs(logs);
    }
  }, [logs]);

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
        setMessage(`Yth. ${name},\n\nStasiun pemindaian otomatis SIPMA mencatat bahwa kelengkapan atribut seragam akademik Anda belum lengkap (Peringatan Atribut 1).${issues}\n\nMohon untuk segera melengkapi atribut wajib tersebut sesuai dengan tata tertib akademik mahasiswa baru yang berlaku sebelum memasuki gerbang kampus.\n\nSalam hangat,\nKomite SIPMA`);
        break;
      case 'Peringatan Atribut 2':
        setMessage(`Yth. ${name},\n\nIni adalah surat Peringatan Atribut 2 mengenai ketidaklengkapan atribut wajib berpakaian Anda yang kembali terdeteksi oleh sistem pemindaian otomatis SIPMA.${issues}\n\nHarap segera melengkapi atribut seragam Anda demi kenyamanan bersama. Jika pelanggaran ini berlanjut, Anda akan diminta untuk melakukan verifikasi disiplin secara manual di kantor komite.\n\nSalam hangat,\nKomite SIPMA`);
        break;
      case 'Peringatan Terakhir':
        setMessage(`Yth. ${name},\n\nIni adalah PERINGATAN TERAKHIR yang diterbitkan oleh sistem administrasi SIPMA untuk ketidaklengkapan atribut pakaian wajib Anda.${issues}\n\nKelalaian yang berkelanjutan ini merupakan bentuk pelanggaran aturan tata tertib akademik. Jika atribut di atas tidak segera dilengkapi pada sesi pemindaian berikutnya, laporan pelanggaran disiplin ini akan secara resmi diteruskan langsung ke Pembina Akademik dan Komite Disiplin Jurusan.\n\nSalam tegas,\nKomite SIPMA`);
        break;
      default:
        setMessage('Pemberitahuan kustom.');
    }
  };

  useEffect(() => {
    if (presetTarget) {
      setActiveStudent(presetTarget);
      setRecipient(presetTarget.whatsapp);
    } else if (incompleteStudents.length > 0 && !activeStudent) {
      setActiveStudent(incompleteStudents[0]);
      setRecipient(incompleteStudents[0].whatsapp);
    }
  }, [presetTarget, students]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendResult(null);
    if (!recipient.trim() || !message.trim()) {
      setSendResult({ ok: false, msg: 'Nomor WhatsApp penerima dan pesan tidak boleh kosong.' });
      return;
    }

    if (!activeStudent || activeStudent.status === 'COMPLETE') {
      setSendResult({ ok: false, msg: '🚫 Mahasiswa ini sudah memiliki atribut lengkap — notifikasi tidak dikirim.' });
      return;
    }

    setIsSending(true);
    try {
      const result = await sendWhatsAppNotification({
        whatsappNumber: recipient,
        studentName:    activeStudent?.fullName || recipient,
        studentStatus:  'INCOMPLETE',
        alertType,
        message,
        source: 'MANUAL',
      });

      const newLog: NotificationLog = {
        recipient,
        studentName: activeStudent?.fullName,
        type: alertType,
        status: result.status === 'SENT' ? 'SENT' : 'FAILED',
        source: 'MANUAL',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };

      onSendMail(newLog);
      setSupabaseLogs(prev => [newLog, ...prev]);
      setSendResult({
        ok: result.status === 'SENT',
        msg: result.status === 'SENT'
          ? `✅ Pesan WhatsApp berhasil dikirim ke ${recipient}`
          : `❌ Gagal mengirim — periksa token Fonnte di Settings`,
      });

      if (presetTarget) onClearPreset();
    } catch {
      setSendResult({ ok: false, msg: '❌ Terjadi kesalahan saat mengirim. Periksa koneksi.' });
    } finally {
      setIsSending(false);
    }
  };

  // Analytics
  const successLogsCount = supabaseLogs.filter(l => l.status === 'SENT').length;
  const autoLogsCount    = supabaseLogs.filter(l => l.source === 'AUTO').length;
  const manualLogsCount  = supabaseLogs.filter(l => l.source === 'MANUAL').length;
  const deliverySuccessRate = supabaseLogs.length ? Math.round((successLogsCount / supabaseLogs.length) * 100) : 100;

  return (
    <div className="flex flex-col gap-6 p-8 bg-[#FDFAF5] overflow-y-auto h-full select-none">

      {/* Preset banner */}
      {presetTarget && (
        <div className="bg-[#ba1a1a]/10 border-2 border-[#ba1a1a]/40 p-4 flex gap-4 items-center justify-between animate-pulse">
          <div className="flex gap-3 items-center">
            <Phone className="w-5 h-5 text-[#ba1a1a]" />
            <div>
              <h4 className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wider">Preset Draf Peringatan WhatsApp Dimuat</h4>
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

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Terkirim', value: successLogsCount, color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Auto (dari Scan)', value: autoLogsCount,   color: 'text-blue-800',   bg: 'bg-blue-50 border-blue-200' },
          { label: 'Manual (dari Panel)', value: manualLogsCount, color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
        ].map(s => (
          <div key={s.label} className={`border ${s.bg} p-3 flex items-center justify-between`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0c132c]">{s.label}</span>
            <span className={`text-lg font-extrabold font-mono ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left: Composer */}
        <section className="col-span-6 bg-white border border-[#D4C9B0] p-6 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-4">
            <header className="border-b border-[#D4C9B0]/60 pb-3">
              <span className="text-[9px] font-bold tracking-widest text-[#0c132c] bg-[#E8DEC8] px-2 py-0.5 uppercase">
                Mesin WhatsApp SIPMA — Supabase + Fonnte
              </span>
              <h3 className="text-sm font-bold text-[#0c132c] tracking-tight mt-1.5">Unit Penyusun Template Peringatan WhatsApp</h3>
            </header>

            {/* Recipient */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">
                Nomor WhatsApp Penerima <span className="text-[#ba1a1a]">(hanya Atribut Tidak Lengkap)</span>
              </label>
              <select
                value={recipient}
                onChange={(e) => {
                  const selectedWhatsapp = e.target.value;
                  setRecipient(selectedWhatsapp);
                  setSendResult(null);
                  const foundStudent = incompleteStudents.find(s => s.whatsapp === selectedWhatsapp);
                  setActiveStudent(foundStudent || null);
                }}
                className="w-full bg-white border border-[#D4C9B0] px-3.5 py-2 text-xs font-bold text-[#0c132c] outline-none"
              >
                {incompleteStudents.length === 0 ? (
                  <option value="">Tidak ada mahasiswa dengan atribut tidak lengkap</option>
                ) : (
                  <>
                    <option value="">-- Pilih Mahasiswa --</option>
                    {incompleteStudents.map(student => (
                      <option key={student.id} value={student.whatsapp}>
                        {student.fullName} - {student.userId} ({student.whatsapp})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Alert category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Kategori Peringatan</label>
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

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Isi Pesan WhatsApp</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-medium text-[#0c132c] focus:outline-none font-mono leading-relaxed"
              />
            </div>

            {/* Send result feedback */}
            {sendResult && (
              <div className={`p-3 text-[11px] font-semibold border ${sendResult.ok
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-200 text-[#ba1a1a]'}`}>
                {sendResult.msg}
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSending || !recipient}
                className="w-full bg-[#0c132c] hover:bg-[#212842] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim via Fonnte API...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Peringatan WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Right: Log list */}
        <section className="col-span-6 bg-white border border-[#D4C9B0] shadow-sm flex flex-col justify-between">
          <div>
            <header className="p-5 border-b border-[#D4C9B0]/60 flex items-center justify-between">
              <div>
                <h4 className="font-sans text-sm font-bold text-[#0c132c] flex items-center gap-2">
                  Log WhatsApp Keluar
                  {isLoadingLogs && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#76767e]" />}
                </h4>
                <p className="text-[10px] text-[#76767e] mt-1 font-semibold">
                  Data dari Supabase · {supabaseLogs.length} catatan
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#0c132c] block">KEMAMPUAN KIRIM</span>
                <span className="text-xs font-mono font-bold text-emerald-800">{deliverySuccessRate}% Sukses</span>
              </div>
            </header>

            <div className="divide-y divide-[#D4C9B0]/40 overflow-y-auto max-h-[380px]">
              {supabaseLogs.length === 0 ? (
                <div className="p-8 text-center">
                  <WifiOff className="w-8 h-8 text-[#D4C9B0] mx-auto mb-2" />
                  <p className="text-xs text-[#76767e] font-semibold">Belum ada log notifikasi</p>
                </div>
              ) : supabaseLogs.map((log, index) => {
                const isSent = log.status === 'SENT';
                const isAuto = log.source === 'AUTO';
                return (
                  <div key={index} className="p-3.5 flex items-center justify-between hover:bg-[#FDFAF5]/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${isSent ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-[#ba1a1a]'}`}>
                        {isSent ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-[11px] font-bold text-[#0c132c]">{log.recipient}</h5>
                          {log.studentName && (
                            <span className="flex items-center gap-0.5 text-[9px] text-[#76767e] font-semibold">
                              <User className="w-2.5 h-2.5" /> {log.studentName}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1.5 items-center mt-0.5">
                          {/* SOURCE BADGE */}
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${isAuto
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                            {isAuto ? (
                              <span className="flex items-center gap-0.5"><Zap className="w-2 h-2 inline" /> AUTO</span>
                            ) : 'MANUAL'}
                          </span>
                          <span className="text-[9px] font-bold text-[#76767e] uppercase tracking-wider">
                            {log.type}
                          </span>
                          <span className="text-[9px] text-gray-300 font-bold">•</span>
                          <span className="text-[9px] text-[#76767e] font-semibold">{log.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest ${isSent
                      ? 'bg-emerald-50 text-[#0c6b44] border border-emerald-300/40'
                      : 'bg-red-50 text-[#ba1a1a] border border-[#ba1a1a]/30 animate-pulse'
                    }`}>
                      {isSent ? 'TERKIRIM' : 'GAGAL'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <footer className="p-3 bg-[#FDFAF5] border-t border-[#D4C9B0]/60 text-[10px] font-semibold text-[#46464d] flex justify-between items-center">
            <span>Tersimpan di Supabase PostgreSQL</span>
            <span className="text-[#0c132c] font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Fonnte WA Gateway Aktif
            </span>
          </footer>
        </section>

      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../lib/supabaseClient';
import { NotificationLog } from '../types';

// ─── Tipe Payload ────────────────────────────────────────────────────────────

export interface SendWhatsAppPayload {
  whatsappNumber: string;   // e.g. "081234567808"
  studentName:    string;
  studentStatus:  'COMPLETE' | 'INCOMPLETE';
  alertType:      string;   // "Peringatan Atribut 1" | "2" | "Terakhir"
  message:        string;
  source:         'AUTO' | 'MANUAL';
}

export interface SendWhatsAppResult {
  status:   'SENT' | 'FAILED' | 'BLOCKED';
  log?:     NotificationLog;
  errorMsg?: string;
}

// ─── Helper: format timestamp ─────────────────────────────────────────────────

function nowTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 16);
}

// ─── Kirim Notifikasi WhatsApp ────────────────────────────────────────────────
// Alur:
//  1. Guard: jika status COMPLETE → langsung return BLOCKED
//  2. Panggil Fonnte API via Supabase Edge Function (server-side, aman)
//  3. Simpan log ke tabel notification_logs di Supabase

export async function sendWhatsAppNotification(
  payload: SendWhatsAppPayload
): Promise<SendWhatsAppResult> {

  // Guard utama: blokir jika atribut sudah lengkap
  if (payload.studentStatus === 'COMPLETE') {
    return {
      status: 'BLOCKED',
      errorMsg: 'Atribut mahasiswa sudah lengkap — notifikasi tidak dikirim.',
    };
  }

  let waStatus: 'SENT' | 'FAILED' = 'FAILED';

  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/notifications/whatsapp', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        target: payload.whatsappNumber,
        message: payload.message
      })
    });

    if (response.ok) {
      const resData = await response.json();
      console.log('[notificationsApi] Backend WA Response:', resData);
      if (resData.success === true) {
        waStatus = 'SENT';
      } else {
        waStatus = 'FAILED';
      }
    } else {
      waStatus = 'FAILED';
    }
  } catch (err) {
    console.error('[notificationsApi] Fonnte API call error:', err);
    waStatus = 'FAILED';
  }

  // Simpan log ke Supabase
  const logEntry: NotificationLog = {
    recipient:   payload.whatsappNumber,
    studentName: payload.studentName,
    type:        payload.alertType,
    status:      waStatus,
    source:      payload.source,
    timestamp:   nowTimestamp(),
  };

  try {
    await supabase.from('notification_logs').insert({
      recipient:    logEntry.recipient,
      student_name: logEntry.studentName,
      alert_type:   logEntry.type,
      status:       logEntry.status,
      source:       logEntry.source,
      sent_at:      new Date().toISOString(),
    });
  } catch (dbErr) {
    console.warn('[notificationsApi] Gagal menyimpan log ke Supabase:', dbErr);
  }

  return { status: waStatus, log: logEntry };
}

// ─── Ambil semua log dari Supabase ───────────────────────────────────────────

export async function fetchNotificationLogs(): Promise<NotificationLog[]> {
  const { data, error } = await supabase
    .from('notification_logs')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[notificationsApi] Gagal mengambil log:', error.message);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    recipient:   String(row.recipient   ?? ''),
    studentName: String(row.student_name ?? ''),
    type:        String(row.alert_type  ?? ''),
    status:      (row.status as 'SENT' | 'FAILED') ?? 'FAILED',
    source:      (row.source as 'AUTO' | 'MANUAL')  ?? 'MANUAL',
    timestamp:   String(row.sent_at ?? '').replace('T', ' ').substring(0, 16),
  }));
}

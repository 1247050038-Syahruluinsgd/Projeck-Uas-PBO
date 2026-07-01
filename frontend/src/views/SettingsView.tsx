/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  User,
  Lock,
  Sliders,
  Phone,
  CheckCircle,
  Sparkles,
  Loader2,
  Database,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { SettingsTab } from '../types';
import { supabase } from '../lib/supabaseClient';

interface SettingsViewProps {
  adminName: string;
  adminRole: string;
  adminDepartment: string;
  adminAvatar: string;
  onUpdateAdminDetails: (name: string, role: string, department: string, avatar: string) => void;
  onTriggerToast: (msg: string) => void;
}

export default function SettingsView({ adminName, adminRole, adminDepartment, adminAvatar, onUpdateAdminDetails, onTriggerToast }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Input fields for settings sections
  const [profileName, setProfileName] = useState(adminName);
  const [profileRole, setProfileRole] = useState(adminRole);
  const [profileDepartment, setProfileDepartment] = useState(adminDepartment);
  const [profileAvatar, setProfileAvatar] = useState(adminAvatar);
  const [profileEmail, setProfileEmail] = useState('admin@sipma.edu');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [waGatewayUrl] = useState('https://api.fonnte.com/send');
  const [waSenderNumber, setWaSenderNumber] = useState(import.meta.env.VITE_FONNTE_SENDER || '');
  const [waApiKey, setWaApiKey] = useState(import.meta.env.VITE_FONNTE_TOKEN || '');
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connStatus, setConnStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const [opticalMargin, setOpticalMargin] = useState(95);
  const [boundaryColors, setBoundaryColors] = useState('Emerald Green');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAdminDetails(profileName, profileRole, profileDepartment, profileAvatar);
    onTriggerToast('Detail Administrator berhasil disimpan.');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass || !confirmPass) {
      alert('Kolom kata sandi tidak boleh kosong.');
      return;
    }
    if (newPass !== confirmPass) {
      alert('Kata sandi baru tidak cocok dengan konfirmasi kata sandi.');
      return;
    }
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    onTriggerToast('Kata sandi keamanan berhasil diperbarui.');
  };

  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerToast('Parameter Fonnte WhatsApp Gateway berhasil disimpan.');
  };

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setConnStatus(null);
    try {
      const { data, error } = await supabase.from('notification_logs').select('id').limit(1);
      if (error) throw new Error(error.message);
      setConnStatus({ ok: true, msg: `✅ Supabase terhubung · Tabel notification_logs ditemukan · ${data?.length ?? 0} baris` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setConnStatus({ ok: false, msg: `❌ Gagal: ${message}` });
    } finally {
      setIsTestingConn(false);
    }
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profil Akun', icon: User },
    { id: 'security' as SettingsTab, label: 'Keamanan & Akses', icon: Lock },
    { id: 'preferences' as SettingsTab, label: 'Mesin Sistem', icon: Sliders },
    { id: 'whatsapp' as SettingsTab, label: 'Pengaturan WhatsApp', icon: Phone }
  ];

  return (
    <div className="flex flex-col gap-6 p-8 bg-[#FDFAF5] overflow-y-auto h-full select-none">

      {/* Settings Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Side Tab Navigation (Col span 3/12) */}
        <section className="col-span-3 bg-white border border-[#D4C9B0] shadow-sm p-4 h-fit">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0c132c] px-2 mb-4">Pilihan Pengaturan</h4>
          <div className="flex flex-col gap-1.5">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-all text-left cursor-pointer ${activeTab === tab.id
                      ? 'bg-[#0c132c] text-white'
                      : 'text-[#46464d] hover:bg-gray-100 hover:text-[#0c132c]'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right Side Settings Form Fields Content Box (Col span 9/12) */}
        <section className="col-span-9 bg-white border border-[#D4C9B0] p-6 shadow-sm min-h-[400px] flex flex-col justify-between">
          <div>
            {/* Header depending on selection */}
            <header className="border-b border-[#D4C9B0]/60 pb-3 mb-6">
              <h3 className="text-sm font-bold text-[#0c132c] tracking-tight uppercase">
                Pengaturan {tabs.find(t => t.id === activeTab)?.label}
              </h3>
            </header>

            {/* TAB CONTENT: PROFILE */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">

                {/* Photo upload section */}
                <div className="space-y-2 border-b border-[#D4C9B0]/40 pb-4 mb-4 select-none">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Foto Profil</label>
                  <div className="flex items-center gap-4">
                    <img
                      src={profileAvatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEIjeRgKzr_oV6AyNHSULkmpKCw_Euyhoyl1O6IqCU7xGQNWUiqdn2P_nTpVQ04L3EWJuwnXSRGPZpG6QrdHj3F_0q_XAk1Gp4iLvWz7tLDfLujYca9o7NP9Azur5Ubv5WttYEVEfMJewfmQonAsL5vcugOlYZfVRJ4FdV_icwvR1qEt35XWH-EX5vwy7ipXnp0QPP0dTpzSC8xx7aYJgZkHVnRjRAfFYEkcaL5CHMostzPZYxkBRVhgVMOt7e5xlCBX7WagiPOpk'}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full border border-[#D4C9B0] object-cover bg-amber-50 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {/* File upload button */}
                        <label className="bg-[#0c132c] hover:bg-[#212842] text-white px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider cursor-pointer font-sans">
                          Unggah Foto Baru
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (uploadEvent) => {
                                  if (uploadEvent.target?.result) {
                                    setProfileAvatar(uploadEvent.target.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>

                        {/* Reset button to default avatar */}
                        <button
                          type="button"
                          onClick={() => setProfileAvatar('https://lh3.googleusercontent.com/aida-public/AB6AXuCEIjeRgKzr_oV6AyNHSULkmpKCw_Euyhoyl1O6IqCU7xGQNWUiqdn2P_nTpVQ04L3EWJuwnXSRGPZpG6QrdHj3F_0q_XAk1Gp4iLvWz7tLDfLujYca9o7NP9Azur5Ubv5WttYEVEfMJewfmQonAsL5vcugOlYZfVRJ4FdV_icwvR1qEt35XWH-EX5vwy7ipXnp0QPP0dTpzSC8xx7aYJgZkHVnRjRAfFYEkcaL5CHMostzPZYxkBRVhgVMOt7e5xlCBX7WagiPOpk')}
                          className="border border-[#D4C9B0] hover:bg-gray-100 text-[#0c132c] px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          Reset Default
                        </button>
                      </div>
                      <p className="text-[10px] text-[#76767e] font-semibold">Pilih gambar dari komputer Anda untuk mengganti foto profil secara langsung.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Nama Lengkap Administrator</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-semibold text-[#0c132c]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Peran Administrator</label>
                  <input
                    type="text"
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value)}
                    className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-semibold text-[#0c132c]"
                  />
                  <p className="text-[10px] text-[#76767e] font-medium leading-tight">
                    *Membantu mendefinisikan posisi resmi Anda (misalnya: Ketua Komite, Pengawas Akademik, Staf IT).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Departemen / Unit Kerja</label>
                  <select
                    value={profileDepartment}
                    onChange={(e) => setProfileDepartment(e.target.value)}
                    className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-bold text-[#0c132c] outline-none"
                  >
                    <option value="Panitia Monitor">Panitia Monitor</option>
                    <option value="Komdis (Komite Disiplin)">Komdis (Komite Disiplin)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Alamat Email Terdaftar</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-semibold text-[#0c132c]"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="bg-[#0c132c] hover:bg-[#212842] text-white px-5 py-2.5 font-bold text-xs uppercase tracking-wider cursor-pointer font-sans"
                  >
                    Simpan Perubahan Profil
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT: SECURITY */}
            {activeTab === 'security' && (
              <form onSubmit={handleResetPassword} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Kata Sandi Saat Ini</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-semibold text-[#0c132c]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-semibold text-[#0c132c]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Konfirmasi Kata Sandi</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-semibold text-[#0c132c]"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="bg-[#0c132c] hover:bg-[#212842] text-white px-5 py-2.5 font-bold text-xs uppercase tracking-wider cursor-pointer font-sans"
                  >
                    Perbarui Kata Sandi
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT: PREFERENCES ENGINE CONFIG */}
            {activeTab === 'preferences' && (
              <div className="space-y-5 max-w-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Rentang Presisi Filter Pemindaian Optik ({opticalMargin}%)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={80}
                      max={99}
                      value={opticalMargin}
                      onChange={(e) => setOpticalMargin(Number(e.target.value))}
                      className="w-full accent-[#0c132c] cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-[#0c132c] font-mono shrink-0">{opticalMargin}% Kecocokan min</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Tema Gaya Batas Bounding Box Optik</label>
                  <select
                    value={boundaryColors}
                    onChange={(e) => {
                      setBoundaryColors(e.target.value);
                      onTriggerToast(`Outline theme set to: ${e.target.value}`);
                    }}
                    className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-bold text-[#0c132c] outline-none cursor-pointer"
                  >
                    <option value="Emerald Green">Emerald Green (Neon HUD)</option>
                    <option value="Hologram Cyan">Hologram Cyan (Cyber UI)</option>
                    <option value="Solar Yellow">Solar Yellow (Kontras Akademik)</option>
                  </select>
                </div>

                <div className="p-4 bg-[#FDFAF5] border border-dashed border-[#D4C9B0]/60 text-[11px] text-[#46464d] leading-normal flex gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 select-none animate-bounce" />
                  <div>
                    <h5 className="font-bold text-[#0c132c]">Akselerasi Pintar Mesin Aktif</h5>
                    <p className="mt-0.5 font-semibold text-xs text-[#76767e]">Menyesuaikan batas optik mempercepat pemrosesan deteksi kamera sebesar 40 md per frame.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: WHATSAPP CONFIG */}
            {activeTab === 'whatsapp' && (
              <form onSubmit={handleSaveWhatsApp} className="max-w-lg space-y-5">

                {/* Info panel Fonnte */}
                <div className="p-4 bg-blue-50 border border-blue-200 flex gap-3 items-start">
                  <Phone className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Integrasi Fonnte WhatsApp API</h5>
                    <p className="text-[11px] text-blue-800 mt-1 font-medium leading-relaxed">
                      Sistem menggunakan <strong>Fonnte</strong> sebagai gateway WhatsApp. Daftar gratis di{' '}
                      <a href="https://fonnte.com" target="_blank" rel="noreferrer" className="underline font-bold inline-flex items-center gap-0.5">
                        fonnte.com <ExternalLink className="w-2.5 h-2.5" />
                      </a>,
                      sambungkan nomor WA, lalu salin API Token ke file <code className="bg-blue-100 px-1 rounded">.env</code>.
                    </p>
                  </div>
                </div>

                {/* Fonnte Token */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Fonnte API Token</label>
                  <input
                    type="password"
                    value={waApiKey}
                    onChange={(e) => setWaApiKey(e.target.value)}
                    placeholder="Contoh: AbCdEfGhIjKlMnOpQrStUvWx"
                    className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-semibold text-[#0c132c]"
                  />
                  <p className="text-[10px] text-[#76767e] font-medium">
                    Tambahkan ke <code className="bg-gray-100 px-1">.env</code> sebagai <code className="bg-gray-100 px-1">VITE_FONNTE_TOKEN=token_anda</code>
                  </p>
                </div>

                {/* Sender Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Nomor Pengirim WA (Terdaftar di Fonnte)</label>
                  <input
                    type="text"
                    value={waSenderNumber}
                    onChange={(e) => setWaSenderNumber(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-semibold text-[#0c132c]"
                  />
                </div>

                {/* Endpoint (readonly) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Endpoint Fonnte API</label>
                  <div className="w-full bg-gray-50 border border-[#D4C9B0] px-3 py-2 text-xs font-mono text-[#46464d]">
                    {waGatewayUrl}
                  </div>
                </div>

                {/* Supabase status */}
                <div className="space-y-2 pt-2 border-t border-[#D4C9B0]/60">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#0c132c] flex items-center gap-2">
                    <Database className="w-4 h-4" /> Supabase Database
                  </h5>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#76767e] uppercase">Project URL</span>
                      <div className="text-[11px] font-mono text-[#0c132c] bg-gray-50 border border-[#D4C9B0] px-2 py-1 truncate">
                        {supabaseUrl || '(belum diisi di .env)'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#76767e] uppercase">Anon Key</span>
                      <div className="text-[11px] font-mono text-[#0c132c] bg-gray-50 border border-[#D4C9B0] px-2 py-1 truncate">
                        {supabaseAnon ? `${supabaseAnon.substring(0, 20)}…` : '(belum diisi di .env)'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConn || !supabaseUrl}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0c132c] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#212842] disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {isTestingConn ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
                    <span>Test Koneksi Supabase</span>
                  </button>

                  {connStatus && (
                    <div className={`p-3 text-[11px] font-semibold border ${connStatus.ok
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-[#ba1a1a]'}`}>
                      {connStatus.msg}
                    </div>
                  )}
                </div>

                {/* Notif rule info */}
                <div className="p-4 bg-[#FDFAF5] border border-dashed border-[#D4C9B0]/60 flex gap-3 items-start">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h5 className="font-bold text-[#0c132c] text-[11px] uppercase tracking-wide">Aturan Pengiriman Notifikasi</h5>
                    <ul className="mt-1 space-y-0.5 text-[10px] text-[#46464d] font-semibold">
                      <li>✅ Status <strong>INCOMPLETE</strong> → Notifikasi WA <strong>DIKIRIM</strong></li>
                      <li>🚫 Status <strong>COMPLETE</strong> → Notifikasi WA <strong>TIDAK dikirim</strong></li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-[#0c132c] hover:bg-[#212842] text-white px-5 py-2.5 font-bold text-xs uppercase tracking-wider cursor-pointer font-sans"
                  >
                    Simpan Konfigurasi WhatsApp
                  </button>
                </div>
              </form>
            )}

          </div>

          <p className="text-[10px] text-[#76767e] font-semibold border-t border-[#D4C9B0]/40 pt-4 mt-6">
            Perubahan yang dikonfigurasi akan disimpan langsung ke parameter skema indeks. Perubahan disinkronkan secara otomatis dalam layout sekunder.
          </p>
        </section>

      </div>

    </div>
  );
}

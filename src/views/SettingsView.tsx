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
  Mail, 
  CheckCircle, 
  SlidersHorizontal,
  Workflow,
  HelpCircle,
  HelpCircle as QuestionIcon,
  ChevronsRight,
  Sparkles
} from 'lucide-react';
import { SettingsTab } from '../types';

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

  const [smtpHost, setSmtpHost] = useState('smtp.university-hub.edu');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpEmail, setSmtpEmail] = useState('smtp-auth@university.edu');
  const [smtpPassword, setSmtpPassword] = useState('••••••••');
  const [smtpAuth, setSmtpAuth] = useState(true);

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

  const handleSaveSMTP = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerToast('Parameter server SMTP berhasil disimpan ke sistem.');
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profil Akun', icon: User },
    { id: 'security' as SettingsTab, label: 'Keamanan & Akses', icon: Lock },
    { id: 'preferences' as SettingsTab, label: 'Mesin Sistem', icon: Sliders },
    { id: 'email' as SettingsTab, label: 'Pengaturan SMTP', icon: Mail }
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
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === tab.id
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

            {/* TAB CONTENT: SMTP CONFIG */}
            {activeTab === 'email' && (
              <form onSubmit={handleSaveSMTP} className="max-w-md space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Host Pengiriman SMTP</label>
                  <input 
                    type="text" 
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-semibold text-[#0c132c]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Akun Kredensial (Email SMTP)</label>
                    <input 
                      type="email" 
                      value={smtpEmail}
                      onChange={(e) => setSmtpEmail(e.target.value)}
                      placeholder="misal: namaanda@gmail.com"
                      className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-semibold text-[#0c132c]"
                    />
                  </div>

                  <div className="col-span-1 space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Port SMTP</label>
                    <input 
                      type="text" 
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="587"
                      className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-semibold text-[#0c132c]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0c132c] block">Kata Sandi / App Password</label>
                  <input 
                    type="password" 
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    placeholder="Masukkan Sandi Aplikasi SMTP"
                    className="w-full bg-white border border-[#D4C9B0] px-3 py-2 text-xs font-semibold text-[#0c132c]"
                  />
                  <span className="text-[10px] font-medium text-[#76767e] block">
                    *Gunakan <strong>App Password (Sandi Aplikasi)</strong> jika menggunakan Gmail/Yahoo dengan 2-Step Verification aktif.
                  </span>
                </div>

                {/* SMTP Connection Checker status */}
                <div className="p-4 bg-emerald-50 border border-emerald-400/40 text-xs font-semibold text-emerald-950 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold uppercase text-[10px] block text-emerald-800">Status Koneksi Host SMTP:</span>
                    <span className="font-medium mt-0.5 text-emerald-950 block text-xs">
                      Berhasil terhubung ke {smtpHost || 'server'} lewat port {smtpPort || '587'} menggunakan akun {smtpEmail || '(kosong)'}.
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="bg-[#0c132c] hover:bg-[#212842] text-white px-5 py-2.5 font-bold text-xs uppercase tracking-wider cursor-pointer font-sans"
                  >
                    Simpan Konfigurasi SMTP
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

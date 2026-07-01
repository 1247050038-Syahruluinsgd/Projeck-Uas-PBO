/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Bell, Search, GraduationCap, User } from 'lucide-react';
import { AppView, StudentRecord } from '../types';
import { ASSET_URLS } from '../data';

interface HeaderProps {
  currentView: AppView;
  adminName: string;
  adminRole: string;
  adminAvatar: string;
  notificationCount: number;
  unreadCount: number;
  onNavigate: (view: AppView) => void;
  incompleteStudents?: StudentRecord[];
}

export default function Header({
  currentView,
  adminName,
  adminRole,
  adminAvatar,
  notificationCount,
  unreadCount,
  onNavigate,
  incompleteStudents
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  // Determine title and navigation path metadata
  const renderBreadcrumbs = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="flex items-center gap-1.5 selection:bg-indigo-100">
            <h2 className="font-sans text-[#0c132c] text-lg font-bold tracking-tight">SIPMA</h2>
            <span className="text-[#76767e] text-sm font-light select-none">/</span>
            <span className="text-[#46464d] text-sm select-none font-medium">Dashboard</span>
          </div>
        );
      case 'detection-input':
        return (
          <div className="flex items-center gap-1.5">
            <h2 className="font-sans text-[#0c132c] text-lg font-bold tracking-tight">Deteksi Atribut</h2>
            <span className="text-[#76767e] text-sm font-light select-none">/</span>
            <span className="text-[#46464d] text-sm select-none font-medium">Input Profil Mahasiswa</span>
          </div>
        );
      case 'detection-live':
        return (
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-[#0c132c] text-lg font-bold tracking-tight">Logika Deteksi Atribut</h2>
            <span className="bg-[#dbe2fc] text-[#141b2e] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider scale-90">
              Sesi Aktif
            </span>
          </div>
        );
      case 'history':
        return (
          <div className="flex items-center gap-1.5">
            <h2 className="font-sans text-[#0c132c] text-lg font-bold tracking-tight">Riwayat Deteksi</h2>
          </div>
        );
      case 'notifications':
        return (
          <div className="flex items-center gap-1.5">
            <h2 className="font-sans text-[#0c132c] text-lg font-bold tracking-tight">SIPMA</h2>
            <span className="text-[#76767e] text-sm font-light select-none">/</span>
            <span className="text-[#46464d] text-sm select-none font-medium">Pusat Notifikasi</span>
          </div>
        );
      case 'settings':
        return (
          <div className="flex items-center gap-1.5">
            <h2 className="font-sans text-[#0c132c] text-lg font-bold tracking-tight">Pengaturan Sistem</h2>
          </div>
        );
      case 'profile':
        return (
          <div className="flex items-center gap-1.5">
            <h2 className="font-sans text-[#0c132c] text-lg font-bold tracking-tight">Profil Pengguna</h2>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5">
            <h2 className="font-sans text-[#0c132c] text-lg font-bold tracking-tight">SIPMA</h2>
          </div>
        );
    }
  };

  return (
    <header className="h-16 bg-[#fcf8fb] border-b border-[#c6c6ce]/30 flex justify-between items-center px-8 z-40 select-none shrink-0">
      {/* Title & Breadcrumbs */}
      <div>{renderBreadcrumbs()}</div>

      {/* Right Actions Block */}
      <div className="flex items-center gap-5">
        {/* Quick Utilities */}
        <div className="flex items-center gap-3 text-[#46464d]">
          <button 
            type="button"
            onClick={() => onNavigate('notifications')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f0edf0]/50 hover:text-[#0c132c] transition-all relative cursor-pointer"
            title="Notifications"
          >
            <Mail className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full animate-pulse" />
            )}
          </button>
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f0edf0]/50 hover:text-[#0c132c] transition-all relative cursor-pointer"
              title="System Alerts"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2 min-w-4 h-4 bg-[#ba1a1a] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Dropdown Popover */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#D4C9B0] shadow-xl z-50 p-4 rounded-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-[#D4C9B0]/40">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#0c132c]">Peringatan Sistem ({notificationCount})</span>
                    <button 
                      className="text-[10px] text-[#76767e] hover:text-[#0c132c] underline font-bold cursor-pointer"
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate('notifications');
                      }}
                    >
                      Lihat Semua
                    </button>
                  </div>
                  <div className="mt-2 space-y-2.5 max-h-60 overflow-y-auto">
                    {incompleteStudents && incompleteStudents.length > 0 ? (
                      incompleteStudents.map((student) => (
                        <div 
                          key={student.id} 
                          className="flex items-start gap-2.5 p-2 hover:bg-[#FDFAF5]/80 cursor-pointer rounded-sm border-b border-dashed border-[#D4C9B0]/20"
                          onClick={() => {
                            setShowNotifications(false);
                            onNavigate('dashboard');
                          }}
                        >
                          <div className="w-2 h-2 bg-[#ba1a1a] rounded-full mt-1.5 shrink-0" />
                          <div className="flex-grow">
                            <p className="text-xs font-bold text-[#0c132c]">{student.fullName}</p>
                            <p className="text-[10px] text-[#76767e] font-semibold mt-0.5">Atribut belum lengkap: {student.userId}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#76767e] py-4 text-center font-medium">Semua atribut mahasiswa lengkap!</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="h-8 w-px bg-[#c6c6ce]/40" />

        {/* User Block */}
        <div 
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-[#1b1b1d] leading-tight">{adminName}</p>
            <p className="text-[10px] text-[#46464d] mt-0.5 font-medium">{adminRole}</p>
          </div>
          
          <div className="w-10 h-10 rounded-full border border-[#c6c6ce]/40 bg-[#d8dff9] flex items-center justify-center shadow-inner shrink-0 text-[#131a33]">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}

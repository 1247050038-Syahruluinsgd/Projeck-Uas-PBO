/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Eye,
  History,
  Mail,
  Settings,
  User,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onNavigate, onLogout }: SidebarProps) {
  const menuItems = [
    { view: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { view: 'detection-input' as AppView, label: 'Deteksi Atribut', icon: Eye, activePatterns: ['detection-input', 'detection-live'] },
    { view: 'history' as AppView, label: 'Riwayat', icon: History },
    { view: 'notifications' as AppView, label: 'Notifikasi', icon: Mail },
    { view: 'settings' as AppView, label: 'Pengaturan', icon: Settings }
  ];

  const handleItemClick = (view: AppView) => {
    onNavigate(view);
  };

  return (
    <aside className="w-60 h-full bg-[#0c132c] text-white flex flex-col justify-between py-2 border-r border-[#212842] shrink-0 select-none">
      <div className="flex flex-col">
        {/* SIPMA Branding */}
        <div 
          className="px-6 py-8 flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="w-10 h-10 bg-[#3f4661] rounded flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-sans text-xl font-bold tracking-tight text-white leading-none">SIPMA</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#888fae] mt-1 font-semibold">monitor informatika</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 flex flex-col gap-1 px-2">
          {menuItems.map((item) => {
            const isSelected = item.activePatterns 
              ? item.activePatterns.includes(currentView)
              : currentView === item.view;
            const Icon = item.icon;

            return (
              <button
                key={item.view}
                onClick={() => handleItemClick(item.view)}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-200 cursor-pointer text-left w-full ${
                  isSelected
                    ? 'bg-[#3f4661] text-white border-l-4 border-[#dbe2fc]'
                    : 'text-[#888fae] hover:text-white hover:bg-[#212842]'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col gap-1 border-t border-[#3f4661]/30 pt-4 px-2 mb-2">
        <button
          onClick={() => onNavigate('profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-200 cursor-pointer text-left ${
            currentView === 'profile'
              ? 'bg-[#3f4661] text-white border-l-4 border-[#dbe2fc]'
              : 'text-[#888fae] hover:text-white hover:bg-[#212842]'
          }`}
        >
          <User className="w-5 h-5 shrink-0" />
          <span>Profil</span>
        </button>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-200 cursor-pointer text-[#888fae] hover:text-red-400 hover:bg-[#ba1a1a]/10 text-left"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

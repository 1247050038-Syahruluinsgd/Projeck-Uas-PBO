/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppView } from './types';
import { useAppState } from './hooks/useAppState';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Views
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import VerifyOTPView from './views/VerifyOTPView';
import DashboardView from './views/DashboardView';
import DetectionInputView from './views/DetectionInputView';
import DetectionLiveView from './views/DetectionLiveView';
import HistoryView from './views/HistoryView';
import NotificationsView from './views/NotificationsView';
import SettingsView from './views/SettingsView';
import ProfileView from './views/ProfileView';

// Icons for toast
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const {
    isLoggedIn,
    currentView,
    setCurrentView,
    adminName,
    adminRole,
    adminUserId,
    adminDepartment,
    adminAvatar,
    studentsList,
    whatsappLogsQueue,
    isAutoNotifying,
    selectedPresetStudent,
    setSelectedPresetStudent,
    scantargetData,
    setScantargetData,
    toastMessage,
    incompleteCount,
    failedCount,
    incompleteStudents,
    handleLogout,
    handleLoginSuccess,
    handleResetSuccess,
    handleRegisterSuccess,
    handleAddScanRecord,
    handleDeleteRecord,
    handleSendWhatsapp,
    handleTriggerMailAlertForIncomplete,
    handleUpdateAdminDetails,
    triggerToast
  } = useAppState();

  return (
    <div className="w-screen h-screen bg-[#111115] text-[#1b1b1d] flex items-center justify-center selection:bg-[#bfc5e7]/50 select-none">

      {/* Visual Framing Wrapper */}
      <div
        id="sipma-app-root-frame"
        className="w-full h-full bg-white text-base leading-relaxed overflow-hidden relative flex"
      >

        {/* Render Non-Authenticated views */}
        {!isLoggedIn ? (
          <div className="w-full h-full">
            {currentView === 'login' && (
              <LoginView
                onNavigate={(v) => setCurrentView(v)}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
            {currentView === 'register' && (
              <RegisterView
                onNavigate={(v) => setCurrentView(v)}
                onRegisterSuccess={handleRegisterSuccess}
              />
            )}
            {currentView === 'verify' && (
              <VerifyOTPView
                onNavigate={(v) => setCurrentView(v)}
                onResetSuccess={handleResetSuccess}
              />
            )}
          </div>
        ) : (
          /* Render Authenticated workspace with Header and Left Sidebar */
          <div className="flex w-full h-full overflow-hidden">

            {/* Left Navigation Rails Panel */}
            <Sidebar
              currentView={currentView}
              onNavigate={(v) => setCurrentView(v)}
              onLogout={handleLogout}
            />

            {/* Right main viewing and dashboards screens block */}
            <div className="flex-grow h-full flex flex-col bg-[#FDFAF5] overflow-hidden">

              <Header
                currentView={currentView}
                adminName={adminName}
                adminRole={adminRole}
                adminAvatar={adminAvatar}
                notificationCount={incompleteCount}
                unreadCount={failedCount}
                onNavigate={(v) => setCurrentView(v)}
                incompleteStudents={incompleteStudents}
              />

              {/* View router switcher frame */}
              <div className="flex-grow overflow-hidden relative">
                {currentView === 'dashboard' && (
                  <DashboardView
                    students={studentsList}
                    onNavigate={(v) => setCurrentView(v as AppView)}
                    onSelectStudent={handleTriggerMailAlertForIncomplete}
                  />
                )}

                {currentView === 'detection-input' && (
                  <DetectionInputView
                    onNavigate={(v) => setCurrentView(v)}
                    onInitiateDetection={(config) => {
                      setScantargetData(config);
                      setCurrentView('detection-live');
                    }}
                  />
                )}

                {currentView === 'detection-live' && scantargetData && (
                  <DetectionLiveView
                    studentData={scantargetData}
                    onSaveScan={handleAddScanRecord}
                    onCancel={() => setCurrentView('detection-input')}
                  />
                )}

                {currentView === 'history' && (
                  <HistoryView
                    students={studentsList}
                    onDeleteRecord={handleDeleteRecord}
                    onSendNotification={handleTriggerMailAlertForIncomplete}
                  />
                )}

                {currentView === 'notifications' && (
                  <NotificationsView
                    logs={whatsappLogsQueue}
                    presetTarget={selectedPresetStudent}
                    onSendMail={handleSendWhatsapp}
                    onClearPreset={() => setSelectedPresetStudent(null)}
                    students={studentsList}
                  />
                )}

                {currentView === 'settings' && (
                  <SettingsView
                    adminName={adminName}
                    adminRole={adminRole}
                    adminDepartment={adminDepartment}
                    adminAvatar={adminAvatar}
                    onUpdateAdminDetails={handleUpdateAdminDetails}
                    onTriggerToast={triggerToast}
                  />
                )}

                {currentView === 'profile' && (
                  <ProfileView
                    adminName={adminName}
                    adminRole={adminRole}
                    adminDepartment={adminDepartment}
                    adminAvatar={adminAvatar}
                    onNavigate={(v) => setCurrentView(v)}
                  />
                )}
              </div>

            </div>
          </div>
        )}

        {/* 3. Floating Bottom-Right Notifications Toast Overlays (Holographic status indicator) */}
        {toastMessage && (
          <div className="absolute bottom-6 right-6 z-50 animate-bounce cursor-pointer select-all select-none" onClick={() => triggerToast('')}>
            <div className="bg-[#0c132c] border border-cyan-400/40 text-white shadow-2xl p-4 flex items-center gap-4.5 rounded-sm max-w-sm">
              <div className="p-2 bg-emerald-100/10 text-cyan-400 rounded-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-[11px] font-extrabold uppercase tracking-widest text-[#888fae]">Identity Confirmed</h5>
                <p className="text-[11px] text-white/95 mt-1 leading-normal font-semibold">
                  {toastMessage}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

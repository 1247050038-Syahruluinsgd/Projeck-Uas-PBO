/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AppView, 
  StudentRecord, 
  NotificationLog, 
  Gender 
} from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_EMAIL_LOGS,
  ASSET_URLS
} from './data';

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
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function App() {
  // Session Access authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Default logged out to force login on start
  const [currentView, setCurrentView] = useState<AppView>('login');

  // Administrator Details (Editable via Profile/Settings state)
  const [adminName, setAdminName] = useState('Alex Thompson');
  const [adminRole, setAdminRole] = useState('Academic Inspector');
  const [adminUserId, setAdminUserId] = useState('ST-2401');
  const [adminDepartment, setAdminDepartment] = useState('Panitia Monitor');
  const [adminAvatar, setAdminAvatar] = useState(ASSET_URLS.adminAvatar);

  // Registry state tracking lists
  const [studentsList, setStudentsList] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [emailLogsQueue, setEmailLogsQueue] = useState<NotificationLog[]>(INITIAL_EMAIL_LOGS);

  // Cross-view selection data holders
  const [selectedPresetStudent, setSelectedPresetStudent] = useState<StudentRecord | null>(null);
  const [scantargetData, setScantargetData] = useState<{
    fullName: string;
    userId: string;
    email: string;
    gender: Gender;
    hasHijab: boolean;
  } | null>(null);

  // Toast status overlay HUD
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
  };

  useEffect(() => {
    if (toastMessage) {
      const handle = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(handle);
    }
  }, [toastMessage]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('login');
    triggerToast('Secure session logged out.');
  };

  const handleLoginSuccess = (userId: string) => {
    setAdminUserId(userId);
    setIsLoggedIn(true);
    setCurrentView('dashboard');
    triggerToast(`Session initialized for User ID: ${userId}`);
  };

  const handleResetSuccess = () => {
    setCurrentView('login');
    triggerToast('Access passwords reset. Please log in.');
  };

  const handleRegisterSuccess = () => {
    setCurrentView('login');
    triggerToast('Academy profile registered. Pending administrator approval.');
  };

  // Student list modifiers
  const handleAddScanRecord = (newRec: StudentRecord) => {
    setStudentsList([newRec, ...studentsList]);
    setCurrentView('dashboard');
    triggerToast(`Record Saved: Identity coordinates of ${newRec.fullName} verified.`);
  };

  const handleDeleteRecord = (id: string) => {
    setStudentsList(studentsList.filter(s => s.id !== id));
    triggerToast('Scanning record purged from database.');
  };

  // Email outbox modifiers
  const handleSendMail = (newLog: NotificationLog) => {
    setEmailLogsQueue([newLog, ...emailLogsQueue]);
    setCurrentView('notifications');
    triggerToast(`SMTP message dispatched to ${newLog.recipient}`);
  };

  const handleTriggerMailAlertForIncomplete = (student: StudentRecord) => {
    setSelectedPresetStudent(student);
    setCurrentView('notifications');
    triggerToast(`Loaded template configuration for ${student.fullName}`);
  };

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
                notificationCount={studentsList.filter(s => s.status === 'INCOMPLETE').length}
                unreadCount={emailLogsQueue.filter(l => l.status === 'FAILED').length}
                onNavigate={(v) => setCurrentView(v)}
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
                    logs={emailLogsQueue}
                    presetTarget={selectedPresetStudent}
                    onSendMail={handleSendMail}
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
                    onUpdateAdminDetails={(name, role, department, avatar) => {
                      setAdminName(name);
                      if (role) setAdminRole(role);
                      if (department) setAdminDepartment(department);
                      if (avatar) setAdminAvatar(avatar);
                    }}
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
          <div className="absolute bottom-6 right-6 z-50 animate-bounce cursor-pointer select-all select-none" onClick={() => setToastMessage(null)}>
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

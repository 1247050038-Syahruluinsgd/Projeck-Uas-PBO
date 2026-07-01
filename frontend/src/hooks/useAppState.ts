import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, StudentRecord, NotificationLog, Gender } from '../types';
import { INITIAL_STUDENTS, INITIAL_WHATSAPP_LOGS, ASSET_URLS } from '../data';
import { sendWhatsAppNotification, fetchNotificationLogs } from '../api/notificationsApi';

export function useAppState() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('login');

  const [adminName, setAdminName] = useState('Alex Thompson');
  const [adminRole, setAdminRole] = useState('Academic Inspector');
  const [adminUserId, setAdminUserId] = useState('ST-2401');
  const [adminDepartment, setAdminDepartment] = useState('Panitia Monitor');
  const [adminAvatar, setAdminAvatar] = useState(ASSET_URLS.adminAvatar);

  const [studentsList, setStudentsList] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [whatsappLogsQueue, setWhatsappLogsQueue] = useState<NotificationLog[]>(INITIAL_WHATSAPP_LOGS);
  const [isAutoNotifying, setIsAutoNotifying] = useState(false);

  const [selectedPresetStudent, setSelectedPresetStudent] = useState<StudentRecord | null>(null);
  const [scantargetData, setScantargetData] = useState<{
    fullName: string;
    userId: string;
    whatsapp: string;
    gender: Gender;
    hasHijab: boolean;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    fetchNotificationLogs().then(logs => {
      if (logs.length > 0) {
        setWhatsappLogsQueue(logs);
      }
    });
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const handle = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(handle);
    }
  }, [toastMessage]);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentView('login');
    localStorage.removeItem('token');
    triggerToast('Secure session logged out.');
  }, [triggerToast]);

  const handleLoginSuccess = useCallback((adminData: any) => {
    setAdminUserId(adminData.username || '');
    setAdminName(adminData.fullName || 'Administrator');
    setAdminRole(adminData.role || 'Academic Inspector');
    setAdminDepartment(adminData.department || 'Panitia Monitor');
    if (adminData.avatarUrl) {
      setAdminAvatar(adminData.avatarUrl);
    }
    if (adminData.token) {
      localStorage.setItem('token', adminData.token);
    }
    setIsLoggedIn(true);
    setCurrentView('dashboard');
    triggerToast(`Session initialized for User ID: ${adminData.username || ''}`);
  }, [triggerToast]);

  const handleResetSuccess = useCallback(() => {
    setCurrentView('login');
    triggerToast('Access passwords reset. Please log in.');
  }, [triggerToast]);

  const handleRegisterSuccess = useCallback(() => {
    setCurrentView('login');
    triggerToast('Academy profile registered. Pending administrator approval.');
  }, [triggerToast]);

  const handleAddScanRecord = useCallback((newRec: StudentRecord) => {
    setStudentsList(prev => [newRec, ...prev]);
    setCurrentView('dashboard');
    triggerToast(`Record Saved: Identity coordinates of ${newRec.fullName} verified.`);

    if (newRec.status === 'INCOMPLETE') {
      setIsAutoNotifying(true);
      sendWhatsAppNotification({
        whatsappNumber: newRec.whatsapp,
        studentName: newRec.fullName,
        studentStatus: 'INCOMPLETE',
        alertType: 'Peringatan Atribut 1',
        source: 'AUTO',
        message: `Yth. ${newRec.fullName},\n\nSistem pemindaian otomatis SIPMA mencatat bahwa kelengkapan atribut seragam akademik Anda belum lengkap.\n\nMohon segera melengkapi atribut wajib sesuai tata tertib akademik sebelum memasuki gerbang kampus.\n\nSalam hangat,\nKomite SIPMA`,
      }).then((result) => {
        const newLog: NotificationLog = {
          recipient: newRec.whatsapp,
          studentName: newRec.fullName,
          type: 'Peringatan Atribut 1',
          status: result.status === 'BLOCKED' ? 'FAILED' : result.status,
          source: 'AUTO',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
        setWhatsappLogsQueue(prev => [newLog, ...prev]);
        if (result.status === 'SENT') {
          triggerToast(`📱 Notifikasi WhatsApp terkirim ke ${newRec.whatsapp}`);
        } else {
          triggerToast(`⚠️ Gagal kirim notifikasi WA ke ${newRec.whatsapp}`);
        }
      }).finally(() => setIsAutoNotifying(false));
    } else {
      triggerToast(`✅ Atribut lengkap — tidak ada notifikasi WA yang dikirim.`);
    }
  }, [triggerToast]);

  const handleDeleteRecord = useCallback((id: string) => {
    setStudentsList(prev => prev.filter(s => s.id !== id));
    triggerToast('Scanning record purged from database.');
  }, [triggerToast]);

  const handleSendWhatsapp = useCallback((newLog: NotificationLog) => {
    setWhatsappLogsQueue(prev => [newLog, ...prev]);
    setCurrentView('notifications');
    triggerToast(`WhatsApp message dispatched to ${newLog.recipient}`);
  }, [triggerToast]);

  const handleUpdateAdminDetails = useCallback((name: string, role?: string, department?: string, avatar?: string) => {
    setAdminName(name);
    if (role) setAdminRole(role);
    if (department) setAdminDepartment(department);
    if (avatar) setAdminAvatar(avatar);
  }, []);

  const handleTriggerMailAlertForIncomplete = useCallback((student: StudentRecord) => {
    setSelectedPresetStudent(student);
    setCurrentView('notifications');
    triggerToast(`Loaded template configuration for ${student.fullName}`);
  }, [triggerToast]);

  const incompleteCount = useMemo(() => {
    return studentsList.filter(s => s.status === 'INCOMPLETE').length;
  }, [studentsList]);

  const failedCount = useMemo(() => {
    return whatsappLogsQueue.filter(l => l.status === 'FAILED').length;
  }, [whatsappLogsQueue]);

  const incompleteStudents = useMemo(() => {
    return studentsList.filter(s => s.status === 'INCOMPLETE');
  }, [studentsList]);

  return {
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
  };
}

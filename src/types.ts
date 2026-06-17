/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppView =
  | 'login'
  | 'register'
  | 'verify'
  | 'dashboard'
  | 'detection-input'
  | 'detection-live'
  | 'notifications'
  | 'history'
  | 'settings'
  | 'profile';

export type Gender = 'Male' | 'Female';

export interface StudentRecord {
  id: string; // e.g. "01"
  profileUrl: string;
  fullName: string;
  email: string;
  gender: Gender;
  hasHijab: boolean;
  userId: string; // e.g. "ST-202401"
  hasNametag: boolean;
  hasKemejaPutih: boolean;
  hasSabuk: boolean;
  hasKerudungPink: boolean;
  hasRokHitam: boolean;
  hasCelanaHitam: boolean;
  status: 'COMPLETE' | 'INCOMPLETE';
  timestamp: string; // e.g. "2024-05-12 08:32:11"
}

export interface NotificationLog {
  recipient: string;
  type: string;
  status: 'SENT' | 'FAILED';
  timestamp: string;
}

export type SettingsTab = 'profile' | 'security' | 'preferences' | 'email';

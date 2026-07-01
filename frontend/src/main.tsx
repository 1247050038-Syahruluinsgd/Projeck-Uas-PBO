if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Tambahkan import registerSW di sini
import { registerSW } from 'virtual:pwa-register'; 

// 2. Tambahkan blok kode ini untuk mendaftarkan Service Worker PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // Pesan ini akan muncul kalau ada pembaruan pada website
    console.log('Ada update baru pada aplikasi');
  },
  onOfflineReady() {
    // Pesan ini menandakan aplikasi sudah ter-cache dan siap offline
    console.log('Aplikasi siap digunakan offline');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
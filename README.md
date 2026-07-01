# SIPMA — Sistem Informasi Pemantauan Atribut Mahasiswa

Aplikasi full-stack untuk mendeteksi kelengkapan atribut pakaian mahasiswa secara otomatis menggunakan AI (YOLO).

---

## 📁 Struktur Project

```
Project-Uas-PBO-SIPMA-Clean/
│
├── 📂 backend/                  ← Spring Boot Java (REST API)
│   ├── src/
│   │   └── main/java/com/timkita/app/
│   │       ├── controller/      ← REST endpoints (AuthController, DetectionController, dll)
│   │       ├── service/         ← Business logic + AiDetectionClient
│   │       ├── model/           ← Entity classes (Attribute, StudentRecord, dll)
│   │       ├── repository/      ← JPA Repositories
│   │       ├── detector/        ← AiAttributeDetector + MockAttributeDetector
│   │       ├── interfaces/      ← AttributeDetector interface
│   │       └── config/          ← CORS, Security config
│   ├── pom.xml
│   └── run-backend.bat          ← Script untuk jalankan backend dari dalam folder ini
│
├── 📂 frontend/                 ← React + Vite + TypeScript (UI)
│   ├── src/
│   │   ├── views/               ← Halaman UI (Dashboard, Detection, Login, dll)
│   │   ├── components/          ← Komponen reusable (Header, Sidebar)
│   │   ├── api/                 ← API client functions
│   │   └── types.ts             ← TypeScript types
│   ├── package.json
│   └── vite.config.ts
│
├── 📂 ai/                       ← Python AI Model (FastAPI + YOLO)
│   └── deteksi-atribut-ai/
│       ├── detection_api.py     ← FastAPI server (endpoint /predict)
│       ├── camera_detector.py   ← Deteksi real-time via webcam
│       ├── best.pt              ← Model YOLO yang sudah dilatih
│       └── requirements.txt
│   └── run-ai.bat               ← Script untuk jalankan AI server
│
├── run-backend.bat              ← 🚀 Jalankan Spring Boot Backend
├── run-frontend.bat             ← 🚀 Jalankan React Frontend
└── ai/run-ai.bat                ← 🚀 Jalankan Python AI Server
```

---

## 🚀 Cara Menjalankan

Jalankan **3 terminal terpisah** dengan urutan berikut:

### 1. Jalankan AI Server (Python FastAPI)
```bash
# Buka terminal 1, jalankan:
ai\run-ai.bat

# Atau manual:
cd ai/deteksi-atribut-ai
pip install -r requirements.txt
uvicorn detection_api:app --host 0.0.0.0 --port 8000 --reload
```
📌 AI Server akan berjalan di: http://localhost:8000

### 2. Jalankan Backend (Spring Boot Java)
```bash
# Buka terminal 2, jalankan:
run-backend.bat

# Atau manual:
cd backend
mvnw.cmd spring-boot:run
```
📌 Backend akan berjalan di: http://localhost:8080

### 3. Jalankan Frontend (React Vite)
```bash
# Buka terminal 3, jalankan:
run-frontend.bat

# Atau manual:
cd frontend
npm install
npm run dev
```
📌 Frontend akan berjalan di: http://localhost:3000

---

## 🔗 Arsitektur Sistem

```
┌─────────────────┐     upload foto      ┌──────────────────┐     POST /predict    ┌──────────────────┐
│  Frontend React │ ──────────────────► │ Backend Java     │ ──────────────────► │  AI Python       │
│  (port 3000)    │  POST /api/detection │ Spring Boot      │                     │  FastAPI + YOLO  │
│                 │  /analyze            │  (port 8080)     │ ◄────────────────── │  (port 8000)     │
│  ← tampilkan   │ ◄────────────────── │                  │   JSON hasil deteksi │                  │
│    hasil AI    │   JSON atribut       └──────────────────┘                     └──────────────────┘
└─────────────────┘
```

## 🤖 AI Detection

Model AI dapat mendeteksi atribut berikut:
- ✅ `kemeja_benar` / `kemeja_salah` — Kemeja putih
- ✅ `kerudung_benar` / `kerudung_salah` — Kerudung
- ✅ `nametag_ada` — Nametag/papan nama
- ✅ `celana_benar` / `celana_salah` — Celana hitam
- ✅ `rok_benar` / `rok_salah` — Rok hitam
- ✅ `sabuk_ada` — Sabuk

## 📋 Requirement

| Komponen | Versi Minimum |
|----------|--------------|
| Java JDK | 17+ |
| Maven | 3.6+ |
| Node.js | 18+ |
| Python | 3.10+ |
| CUDA (opsional) | Untuk GPU inference yang lebih cepat |

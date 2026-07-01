# Template Git Issues — Backend SIPMA (Spring Boot REST API)

Salin masing-masing issue di bawah ini ke GitHub/GitLab Anda.

---

## Issue #1 — [SETUP] Konfigurasi Awal Spring Boot REST API & Database H2

**Label:** `setup`, `backend`
**Milestone:** Sprint 1 — Backend Foundation

**Deskripsi:**
Melakukan setup awal proyek Spring Boot sebagai backend REST API. Mengkonfigurasi dependensi yang dibutuhkan dan menyiapkan database H2 in-memory untuk development.

**File yang Dibuat/Dimodifikasi:**
- `pom.xml` — Tambah dependensi `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `h2`, `spring-boot-starter-mail`
- `src/main/resources/application.properties` — **[BARU]** Konfigurasi server port, H2 datasource, CORS, dan SMTP
- `src/main/java/com/timkita/app/MainApp.java` — Ubah menjadi Spring Boot entry point (`@SpringBootApplication`)

**Acceptance Criteria:**
- [ ] Aplikasi Spring Boot dapat di-build dan run tanpa error
- [ ] H2 Console dapat diakses di `http://localhost:8080/h2-console`
- [ ] Endpoint root `GET /api` merespons dengan status `200 OK`
- [ ] CORS dikonfigurasi agar frontend React (`localhost:3000`) dapat mengakses API

---

## Issue #2 — [FEATURE] Autentikasi Admin (Register, Login, Verify OTP)

**Label:** `feature`, `backend`, `auth`
**Milestone:** Sprint 1 — Backend Foundation

**Deskripsi:**
Implementasi sistem autentikasi untuk akun Administrator, mencakup registrasi akun baru, login dengan password, dan verifikasi kode OTP untuk reset password.

**File yang Dibuat:**
- `model/Admin.java` — Entitas JPA (id, username, password, fullName, role, department, avatarUrl, otpCode, otpExpiry)
- `repository/AdminRepository.java` — Interface JPA Repository untuk Admin
- `service/AuthService.java` — Logika bisnis (hash password, generate OTP, validasi)
- `controller/AuthController.java` — REST Controller endpoint autentikasi

**Endpoint API:**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/auth/register` | Registrasi akun admin baru |
| `POST` | `/api/auth/login` | Login dan dapatkan session token |
| `POST` | `/api/auth/verify-otp` | Verifikasi kode OTP |

**File Frontend yang Dimodifikasi:**
- `src/views/LoginView.tsx` — Ubah logika ke `fetch POST /api/auth/login`
- `src/views/RegisterView.tsx` — Ubah logika ke `fetch POST /api/auth/register`
- `src/views/VerifyOTPView.tsx` — Ubah logika ke `fetch POST /api/auth/verify-otp`

**Acceptance Criteria:**
- [ ] Admin bisa registrasi akun baru dan tersimpan di database H2
- [ ] Admin bisa login dengan username & password yang benar
- [ ] Login dengan password salah mengembalikan error `401 Unauthorized`
- [ ] OTP bisa digenerate dan diverifikasi dengan benar
- [ ] Frontend berhasil terhubung ke semua endpoint ini

---

## Issue #3 — [FEATURE] Dashboard: Statistik Kepatuhan & Data Scan Terbaru

**Label:** `feature`, `backend`, `dashboard`
**Milestone:** Sprint 2 — Core Features

**Deskripsi:**
Menyediakan data agregasi untuk halaman Dashboard: statistik kepatuhan (total scan, complete, incomplete, persentase) serta daftar hasil pemindaian terbaru yang bisa difilter dan dicari.

**File yang Dibuat:**
- `model/StudentRecord.java` — Entitas JPA (lihat skema di bawah)
- `repository/StudentRecordRepository.java` — Interface JPA Repository dengan custom query
- `service/StudentService.java` — Logika agregasi dan filtering
- `controller/DashboardController.java` — REST Controller endpoint dashboard

**Skema `StudentRecord`:**
```
id (String/UUID), userId (NIM), fullName, email, gender, hasHijab,
status (COMPLETE/INCOMPLETE), hasNametag, hasKemejaPutih, hasSabuk,
hasCelanaHitam (Male), hasRokHitam (Female), hasKerudungPink (Female),
createdAt (LocalDateTime)
```

**Endpoint API:**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/dashboard/stats` | Kembalikan total, complete, incomplete, persentase |
| `GET` | `/api/dashboard/recent?search=&status=` | Daftar scan terbaru terfilter |

**File Frontend yang Dimodifikasi:**
- `src/views/DashboardView.tsx` — Ganti data lokal dengan fetch ke API
- `src/App.tsx` — Hapus state `studentsList` dari data lokal

**Acceptance Criteria:**
- [ ] `GET /api/dashboard/stats` mengembalikan data statistik yang akurat
- [ ] `GET /api/dashboard/recent` mendukung parameter `search` (nama/NIM) dan `status` (ALL/COMPLETE/INCOMPLETE)
- [ ] Dashboard React menampilkan data real dari backend

---

## Issue #4 — [FEATURE] Riwayat Pemindaian: Tampil & Hapus (History Management)

**Label:** `feature`, `backend`, `history`
**Milestone:** Sprint 2 — Core Features

**Deskripsi:**
Menyediakan REST API untuk menampilkan seluruh riwayat pemindaian mahasiswa beserta fitur pencarian, filtering status, dan penghapusan data berdasarkan ID.

**File yang Digunakan (dari Issue #3):**
- `model/StudentRecord.java` *(sudah dibuat di Issue #3)*
- `repository/StudentRecordRepository.java` *(sudah dibuat di Issue #3)*
- `service/StudentService.java` *(dikembangkan)*
- `controller/StudentController.java` — **[BARU]** REST Controller khusus CRUD mahasiswa

**Endpoint API:**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/students?search=&status=` | Ambil semua riwayat scan dengan filter |
| `DELETE` | `/api/students/{id}` | Hapus data scan berdasarkan ID |

**File Frontend yang Dimodifikasi:**
- `src/views/HistoryView.tsx` — Ambil data dan delete via REST API

**Acceptance Criteria:**
- [ ] `GET /api/students` mengembalikan seluruh data dengan filter yang berfungsi
- [ ] `DELETE /api/students/{id}` berhasil menghapus data dari database
- [ ] Penghapusan ID yang tidak ada mengembalikan error `404 Not Found`
- [ ] Frontend History berhasil terhubung dan dapat menghapus data secara real-time

---

## Issue #5 — [FEATURE] Notifikasi: Kirim Email Peringatan & Riwayat Log

**Label:** `feature`, `backend`, `notification`
**Milestone:** Sprint 2 — Core Features

**Deskripsi:**
Implementasi fitur pengiriman email peringatan tertib atribut kepada mahasiswa yang tidak patuh, serta penyimpanan dan pengambilan log pengiriman dari database.

**File yang Dibuat:**
- `model/NotificationLog.java` — Entitas JPA (id, recipient, studentName, subject, body, status, sentAt)
- `repository/NotificationLogRepository.java` — Interface JPA Repository untuk log
- `service/NotificationService.java` — Logika pengiriman email (JavaMailSender) dan penyimpanan log
- `controller/NotificationController.java` — REST Controller endpoint notifikasi

**Endpoint API:**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/notifications/send` | Kirim email peringatan dan simpan log |
| `GET` | `/api/notifications/logs` | Ambil semua log pengiriman email |

**File Frontend yang Dimodifikasi:**
- `src/views/NotificationsView.tsx` — Kirim email & tampilkan log via REST API
- `src/App.tsx` — Hapus state `emailLogsQueue` dari data lokal

**Acceptance Criteria:**
- [ ] `POST /api/notifications/send` menyimpan log dengan status `SENT` atau `FAILED`
- [ ] `GET /api/notifications/logs` mengembalikan daftar log yang tersimpan
- [ ] Frontend Notifications berhasil terhubung ke backend

---

## Issue #6 — [FEATURE] Profil Administrator: Tampil & Update

**Label:** `feature`, `backend`, `profile`
**Milestone:** Sprint 3 — Polish & Integration

**Deskripsi:**
Menyediakan endpoint untuk mengambil dan memperbarui data profil administrator yang sedang aktif (nama, peran, departemen, avatar).

**File yang Dibuat:**
- `service/AdminService.java` — Logika bisnis profil admin
- `controller/AdminController.java` — REST Controller endpoint profil

**Endpoint API:**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/admin/profile` | Ambil data profil admin aktif |
| `PUT` | `/api/admin/profile` | Perbarui profil admin |

**File Frontend yang Dimodifikasi:**
- `src/views/ProfileView.tsx` — Ambil data profil via `GET /api/admin/profile`
- `src/views/SettingsView.tsx` — Simpan perubahan via `PUT /api/admin/profile`
- `src/App.tsx` — Ganti state admin hardcoded dengan data dari API

**Acceptance Criteria:**
- [ ] `GET /api/admin/profile` mengembalikan data profil admin yang benar
- [ ] `PUT /api/admin/profile` berhasil menyimpan perubahan ke database
- [ ] Frontend Profile & Settings berhasil sinkron dengan backend

---

## Issue #7 — [FEATURE] Mock Scanner Input (Non-AI)

**Label:** `feature`, `backend`, `scanner`, `mock`
**Milestone:** Sprint 3 — Polish & Integration

**Deskripsi:**
Karena model AI deteksi belum diimplementasikan, endpoint scan tiruan menerima input data manual atribut mahasiswa dari frontend, mengevaluasi kelengkapan atribut berdasarkan aturan sederhana, lalu menyimpan hasilnya ke database.

**File yang Digunakan:**
- `model/StudentRecord.java` *(sudah dibuat di Issue #3)*
- `service/StudentService.java` *(dikembangkan dengan logika evaluasi)*
- `controller/StudentController.java` *(ditambahkan endpoint baru)*

**Endpoint API:**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/students/scan-mock` | Terima input atribut & simpan hasil evaluasi |

**Logika Evaluasi Kepatuhan:**
- Jika semua field `has*` bernilai `true` → status = `COMPLETE`
- Jika salah satu field `has*` bernilai `false` → status = `INCOMPLETE`

**Acceptance Criteria:**
- [ ] `POST /api/students/scan-mock` menerima data JSON atribut mahasiswa
- [ ] Status dievaluasi secara otomatis dan tersimpan di database
- [ ] Data tersimpan muncul di halaman History dan Dashboard

package com.timkita.app.service;

import com.timkita.app.model.Admin;
import com.timkita.app.repository.AdminRepository;
import com.timkita.app.config.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;

    @Value("${spring.mail.username:your-email@gmail.com}")
    private String mailUsername;

    public AuthService(AdminRepository adminRepository, PasswordEncoder passwordEncoder, EmailService emailService,
            JwtUtil jwtUtil) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Registrasi akun admin baru.
     */
    public Map<String, Object> register(String username, String password, String fullName, String role,
            String department) {
        Map<String, Object> response = new HashMap<>();

        if (adminRepository.existsByUsername(username)) {
            response.put("success", false);
            response.put("message", "Username/Email sudah terdaftar.");
            return response;
        }

        Admin admin = new Admin();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setFullName(fullName);
        admin.setRole(role != null ? role : "Academic Inspector");
        admin.setDepartment(department != null ? department : "Panitia Monitor");
        admin.setActive(false); // Akun tidak aktif sebelum OTP diverifikasi
        admin.setOtpAttempts(0);

        // Generate OTP langsung saat registrasi
        String otp = String.format("%06d", new SecureRandom().nextInt(1000000));
        admin.setOtpCode(otp);
        admin.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        adminRepository.save(admin);

        // Kirim OTP via email setelah akun tersimpan
        System.out.println(">>> [AuthService] Mengirim OTP otomatis setelah registrasi ke: " + username + " | Kode OTP: " + otp);
        try {
            emailService.sendOtpEmail(username, otp);
        } catch (Exception e) {
            System.out.println(">>> [AuthService] Gagal mengirim email OTP, namun registrasi dilanjutkan (Dev Bypass): " + e.getMessage());
        }

        response.put("success", true);
        response.put("otp", otp); // Kembalikan OTP agar frontend bypass dev mode berjalan
        response.put("message",
                "Akun berhasil didaftarkan. Kode OTP telah dikirim ke email Anda (dan tertera di console log). Silakan verifikasi dalam 5 menit.");

        return response;
    }

    /**
     * Login admin dengan username dan password.
     */
    public Map<String, Object> login(String username, String password) {
        Map<String, Object> response = new HashMap<>();

        Optional<Admin> adminOpt = adminRepository.findByUsername(username);
        if (adminOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Username atau password salah.");
            return response;
        }

        Admin admin = adminOpt.get();
        if (!passwordEncoder.matches(password, admin.getPassword())) {
            response.put("success", false);
            response.put("message", "Username atau password salah.");
            return response;
        }

        // Akun tidak aktif dan tidak bisa login sebelum OTP berhasil diverifikasi
        if (!admin.isActive()) {
            response.put("success", false);
            response.put("message", "Akun Anda belum aktif. Silakan lakukan verifikasi OTP terlebih dahulu.");
            return response;
        }

        // Generate secure JWT token
        String token = jwtUtil.generateToken(admin.getUsername());

        response.put("success", true);
        response.put("message", "Login berhasil.");
        response.put("token", token);
        response.put("adminId", admin.getId());
        response.put("username", admin.getUsername());
        response.put("fullName", admin.getFullName());
        response.put("role", admin.getRole());
        response.put("department", admin.getDepartment());
        response.put("avatarUrl", admin.getAvatarUrl());
        return response;
    }

    /**
     * Generate OTP 6 digit dan kirim via email.
     */
    public Map<String, Object> requestOtp(String username) {
        Map<String, Object> response = new HashMap<>();

        Optional<Admin> adminOpt = adminRepository.findByUsername(username);
        if (adminOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Akun dengan email tersebut tidak ditemukan.");
            return response;
        }

        Admin admin = adminOpt.get();
        // OTP harus random dan tidak bisa ditebak
        String otp = String.format("%06d", new SecureRandom().nextInt(1000000));
        admin.setOtpCode(otp);
        admin.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        admin.setOtpAttempts(0); // Reset batas percobaan
        adminRepository.save(admin);

        // Kirim OTP via email
        System.out.println(">>> [AuthService] Mengirim ulang OTP ke: " + admin.getUsername() + " | Kode OTP: " + otp);
        try {
            emailService.sendOtpEmail(admin.getUsername(), otp);
        } catch (Exception e) {
            System.out.println(">>> [AuthService] Gagal mengirim email OTP, namun request-otp dilanjutkan (Dev Bypass): " + e.getMessage());
        }

        response.put("success", true);
        response.put("otp", otp); // Kembalikan OTP agar frontend bypass dev mode berjalan
        response.put("message", "OTP berhasil dikirim ke email (dan tertera di console log).");

        return response;
    }

    /**
     * Verifikasi kode OTP yang dikirimkan pengguna.
     */
    public Map<String, Object> verifyOtp(String username, String otp) {
        Map<String, Object> response = new HashMap<>();

        Optional<Admin> adminOpt = adminRepository.findByUsername(username);
        if (adminOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Akun tidak ditemukan.");
            return response;
        }

        Admin admin = adminOpt.get();

        // Cek apakah batas percobaan input OTP telah terlampaui
        if (admin.getOtpAttempts() >= 5) {
            response.put("success", false);
            response.put("message", "Batas percobaan input OTP telah terlampaui. Silakan minta OTP baru.");
            return response;
        }

        if (admin.getOtpCode() == null) {
            response.put("success", false);
            response.put("message", "Kode OTP tidak valid atau silakan kirim ulang OTP.");
            return response;
        }

        // Cek masa berlaku OTP (5 menit)
        if (admin.getOtpExpiry() == null || LocalDateTime.now().isAfter(admin.getOtpExpiry())) {
            response.put("success", false);
            response.put("message", "Kode OTP sudah kedaluwarsa. Silakan minta OTP baru.");
            return response;
        }

        // Cek kecocokan OTP
        if (!admin.getOtpCode().equals(otp)) {
            int attempts = admin.getOtpAttempts() + 1;
            admin.setOtpAttempts(attempts);

            if (attempts >= 5) {
                // Invalidate OTP jika sudah 5 kali salah
                admin.setOtpCode(null);
                admin.setOtpExpiry(null);
                adminRepository.save(admin);
                response.put("success", false);
                response.put("message", "Batas percobaan input OTP telah terlampaui. Silakan minta OTP baru.");
            } else {
                adminRepository.save(admin);
                response.put("success", false);
                response.put("message", "Kode OTP tidak valid. Sisa percobaan: " + (5 - attempts));
            }
            return response;
        }

        // Jika berhasil dicocokkan
        if (!admin.isActive()) {
            // Registrasi Flow: Aktifkan akun
            admin.setActive(true);
            admin.setOtpCode(null);
            admin.setOtpExpiry(null);
            admin.setOtpAttempts(0);
            adminRepository.save(admin);
        } else {
            // Lupa Password Flow: Jangan hapus OTP dulu agar reset-password bisa
            // memverifikasinya kembali,
            // tetapi reset counter attempts
            admin.setOtpAttempts(0);
            adminRepository.save(admin);
        }

        response.put("success", true);
        response.put("message", "OTP berhasil diverifikasi.");
        return response;
    }

    /**
     * Reset password menggunakan OTP yang valid.
     */
    public Map<String, Object> resetPassword(String username, String otp, String newPassword) {
        Map<String, Object> response = new HashMap<>();

        Optional<Admin> adminOpt = adminRepository.findByUsername(username);
        if (adminOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Akun tidak ditemukan.");
            return response;
        }

        Admin admin = adminOpt.get();

        if (admin.getOtpCode() == null || !admin.getOtpCode().equals(otp)) {
            response.put("success", false);
            response.put("message", "Kode OTP tidak valid.");
            return response;
        }

        if (admin.getOtpExpiry() == null || LocalDateTime.now().isAfter(admin.getOtpExpiry())) {
            response.put("success", false);
            response.put("message", "Kode OTP sudah kedaluwarsa. Silakan minta OTP baru.");
            return response;
        }

        // Set password baru yang sudah dihash
        admin.setPassword(passwordEncoder.encode(newPassword));

        // OTP hanya bisa digunakan 1 kali (hapus setelah reset password)
        admin.setOtpCode(null);
        admin.setOtpExpiry(null);
        admin.setOtpAttempts(0);
        adminRepository.save(admin);

        response.put("success", true);
        response.put("message", "Password berhasil direset. Silakan login.");
        return response;
    }
}

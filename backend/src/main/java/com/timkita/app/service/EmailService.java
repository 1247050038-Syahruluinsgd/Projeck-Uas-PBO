package com.timkita.app.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:your-email@gmail.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Mengirim email berisi kode OTP ke alamat email tujuan.
     */
    public void sendOtpEmail(String toEmail, String otpCode) {
        logger.info(">>> [EmailService] Mencoba mengirim email OTP ke: {}", toEmail);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("SIPMA - Kode Verifikasi OTP");
            message.setText("Halo,\n\n"
                    + "Kode OTP Anda untuk sistem SIPMA adalah: " + otpCode + "\n"
                    + "Kode ini berlaku selama 5 menit.\n\n"
                    + "Jika Anda tidak meminta kode ini, silakan abaikan email ini.\n\n"
                    + "Salam,\nTim Admin SIPMA");

            mailSender.send(message);
            logger.info(">>> [EmailService] Email OTP BERHASIL dikirim ke: {}", toEmail);
        } catch (Exception e) {
            logger.error(">>> [EmailService] GAGAL mengirim email OTP ke: {}", toEmail);
            logger.error(">>> Detail Error SMTP: {}", e.getMessage(), e);

            // Jika menggunakan email default, jangan gagalkan proses (bypass untuk
            // kemudahan testing dev)
            if ("your-email@gmail.com".equals(fromEmail) || fromEmail == null || fromEmail.isEmpty()
                    || fromEmail.contains("YOUR_") || fromEmail.contains("GANTI_")) {
                logger.warn(">>> [EmailService] Melanjutkan dengan dev bypass (tidak melempar exception)");
            } else {
                throw new RuntimeException(
                        "Gagal mengirim email OTP. Pastikan konfigurasi SMTP di .env Anda benar: " + e.getMessage(), e);
            }
        }
    }
}

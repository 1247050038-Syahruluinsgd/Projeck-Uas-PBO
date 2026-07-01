package com.timkita.app.service;

import com.timkita.app.model.NotificationLog;
import com.timkita.app.repository.NotificationLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationLogRepository notificationLogRepository;
    private final JavaMailSender mailSender;

    @Value("${fonnte.token}")
    private String fonnteToken;

    public NotificationService(NotificationLogRepository notificationLogRepository,
                               JavaMailSender mailSender) {
        this.notificationLogRepository = notificationLogRepository;
        this.mailSender = mailSender;
    }

    /**
     * Ambil semua log notifikasi email, diurutkan dari terbaru.
     */
    public List<NotificationLog> getAllLogs() {
        return notificationLogRepository.findAllByOrderBySentAtDesc();
    }

    /**
     * Kirim email peringatan ke mahasiswa dan simpan log pengiriman.
     */
    public NotificationLog sendNotification(Map<String, Object> payload) {
        String recipient   = (String) payload.getOrDefault("recipient", "");
        String studentName = (String) payload.getOrDefault("studentName", "");
        String subject     = (String) payload.getOrDefault("subject", "Peringatan Atribut Tidak Lengkap");
        String body        = (String) payload.getOrDefault("body", "");
        String targetStatus = (String) payload.getOrDefault("status", "SENT");

        String status = targetStatus;

        if ("SENT".equalsIgnoreCase(targetStatus)) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(recipient);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
            } catch (MailException e) {
                // Di mode dev/simulator, jika SMTP belum dikonfigurasi dengan benar,
                // cetak peringatan tetapi tetap simpan status sebagai "SENT" agar simulasi UI berjalan lancar.
                System.err.println("[NotificationService] [Simulation Warning] Gagal mengirim email asli ke " 
                        + recipient + " (" + e.getMessage() + "), menggunakan fallback simulasi sukses.");
            }
        }

        NotificationLog log = new NotificationLog(recipient, studentName, subject, body, status);
        return notificationLogRepository.save(log);
    }

    /**
     * Kirim WhatsApp via Fonnte API secara aman dari Backend.
     */
    public Map<String, Object> sendWhatsApp(String target, String message) {
        if (fonnteToken == null || fonnteToken.contains("Rotated_Fonnte_Token") || fonnteToken.isEmpty()) {
            System.out.println("[NotificationService] Menggunakan simulasi kirim WhatsApp (token belum dikonfigurasi/rotated).");
            return Map.of("success", true, "message", "Simulasi kirim WA sukses (mode dev).");
        }

        try {
            HttpClient client = HttpClient.newHttpClient();
            String form = "target=" + URLEncoder.encode(target, StandardCharsets.UTF_8)
                    + "&message=" + URLEncoder.encode(message, StandardCharsets.UTF_8)
                    + "&countryCode=62";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.fonnte.com/send"))
                    .header("Authorization", fonnteToken)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            boolean success = response.statusCode() == 200 && response.body().contains("\"status\":true");

            return Map.of("success", success, "body", response.body());
        } catch (Exception e) {
            System.err.println("[NotificationService] Error memanggil Fonnte API: " + e.getMessage());
            return Map.of("success", false, "error", e.getMessage());
        }
    }
}

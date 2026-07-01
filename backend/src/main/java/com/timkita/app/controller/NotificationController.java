package com.timkita.app.controller;

import com.timkita.app.dto.WhatsAppRequest;
import com.timkita.app.model.NotificationLog;
import com.timkita.app.service.NotificationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** GET /api/notifications/logs */
    @GetMapping("/logs")
    public ResponseEntity<List<NotificationLog>> getLogs() {
        log.info("[NotificationController] GET /logs request received");
        return ResponseEntity.ok(notificationService.getAllLogs());
    }

    /** POST /api/notifications/send */
    @PostMapping("/send")
    public ResponseEntity<NotificationLog> send(@RequestBody Map<String, Object> payload) {
        log.info("[NotificationController] POST /send request received for student: {}", payload.get("studentName"));
        NotificationLog logEntry = notificationService.sendNotification(payload);
        return ResponseEntity.ok(logEntry);
    }

    /** POST /api/notifications/whatsapp */
    @PostMapping("/whatsapp")
    public ResponseEntity<Map<String, Object>> sendWhatsApp(@Valid @RequestBody WhatsAppRequest request) {
        log.info("[NotificationController] POST /whatsapp request received for target: {}", request.getTarget());
        Map<String, Object> result = notificationService.sendWhatsApp(request.getTarget(), request.getMessage());
        return ResponseEntity.ok(result);
    }
}

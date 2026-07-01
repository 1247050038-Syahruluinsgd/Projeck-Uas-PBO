package com.timkita.app.controller;

import com.timkita.app.detector.AiAttributeDetector;
import com.timkita.app.model.Attribute;
import com.timkita.app.service.AiDetectionClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * DetectionController
 *
 * REST Controller untuk endpoint deteksi atribut.
 * Menerima upload gambar dari frontend React, meneruskannya ke AI server Python,
 * dan mengembalikan hasil deteksi dalam format JSON.
 *
 * Endpoints:
 *   GET  /api/detection/health  → Cek status AI server Python
 *   POST /api/detection/analyze → Upload gambar → deteksi atribut → JSON response
 */
@RestController
@RequestMapping("/api/detection")
public class DetectionController {

    private final AiAttributeDetector aiAttributeDetector;
    private final AiDetectionClient aiDetectionClient;

    public DetectionController(AiAttributeDetector aiAttributeDetector, AiDetectionClient aiDetectionClient) {
        this.aiAttributeDetector = aiAttributeDetector;
        this.aiDetectionClient = aiDetectionClient;
    }

    /**
     * GET /api/detection/health
     * Cek apakah AI Python server sedang berjalan.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkAiHealth() {
        boolean healthy = aiDetectionClient.isAiServerHealthy();

        Map<String, Object> response = new HashMap<>();
        response.put("ai_server_running", healthy);
        response.put("message", healthy
                ? "AI server berjalan dengan baik di port 8000."
                : "AI server tidak aktif. Jalankan ai/run-ai.bat terlebih dahulu.");

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/detection/analyze
     * Menerima upload gambar dari frontend, kirim ke AI server, kembalikan hasil.
     *
     * Request: multipart/form-data dengan field "image" berisi file gambar
     * Response JSON:
     * {
     *   "success": true,
     *   "filename": "foto.jpg",
     *   "attributes": [
     *     { "code": "kemeja_benar", "name": "Kemeja Putih (Benar)", "detected": true },
     *     { "code": "nametag_ada", "name": "Nametag", "detected": false },
     *     ...
     *   ],
     *   "summary": {
     *     "total": 10, "detected": 3, "missing": 7
     *   }
     * }
     */
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> analyzeImage(
            @RequestParam("image") MultipartFile imageFile) {

        Map<String, Object> response = new HashMap<>();

        // Validasi file
        if (imageFile.isEmpty()) {
            response.put("success", false);
            response.put("message", "File gambar tidak boleh kosong.");
            return ResponseEntity.badRequest().body(response);
        }

        String contentType = imageFile.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            response.put("success", false);
            response.put("message", "File harus berupa gambar (JPEG, PNG, dll.).");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            byte[] imageBytes = imageFile.getBytes();
            String filename = imageFile.getOriginalFilename() != null
                    ? imageFile.getOriginalFilename() : "upload.jpg";

            // Jalankan deteksi AI
            List<Attribute> attributes = aiAttributeDetector.detectFromImage(imageBytes, filename);

            // Hitung summary
            long detectedCount = attributes.stream().filter(Attribute::isDetected).count();
            // Hanya hitung atribut "benar" / "ada" (bukan _salah) sebagai berhasil
            long correctCount = attributes.stream()
                    .filter(a -> a.isDetected() && (a.getCode().endsWith("_benar") || a.getCode().endsWith("_ada")))
                    .count();
            long wrongCount = attributes.stream()
                    .filter(a -> a.isDetected() && a.getCode().endsWith("_salah"))
                    .count();

            Map<String, Object> summary = new HashMap<>();
            summary.put("total_attributes", attributes.size());
            summary.put("detected_count", detectedCount);
            summary.put("correct_count", correctCount);
            summary.put("wrong_count", wrongCount);

            response.put("success", true);
            response.put("filename", filename);
            response.put("attributes", attributes);
            response.put("summary", summary);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Terjadi kesalahan saat memproses gambar: " + e.getMessage());
            response.put("hint", "Pastikan AI server sudah berjalan (ai/run-ai.bat).");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}

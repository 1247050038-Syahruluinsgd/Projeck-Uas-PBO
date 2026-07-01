package com.timkita.app.detector;

import com.fasterxml.jackson.databind.JsonNode;
import com.timkita.app.interfaces.AttributeDetector;
import com.timkita.app.model.Attribute;
import com.timkita.app.service.AiDetectionClient;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * AiAttributeDetector
 *
 * Implementasi AttributeDetector yang menggunakan model AI Python (YOLO)
 * untuk mendeteksi atribut dari gambar.
 *
 * Kelas ini menggantikan MockAttributeDetector dengan hasil deteksi nyata.
 * Anotasi @Primary memastikan Spring menggunakan implementasi ini (bukan mock)
 * ketika ada lebih dari satu implementasi AttributeDetector.
 *
 * Catatan: Implementasi ini membutuhkan gambar (byte array) untuk dideteksi.
 * Gunakan DetectionController untuk endpoint yang menerima upload gambar dari frontend.
 */
@Component
@Primary
public class AiAttributeDetector implements AttributeDetector {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AiAttributeDetector.class);

    private final AiDetectionClient aiDetectionClient;

    // Mapping dari label AI Python ke nama display yang lebih ramah pengguna
    private static final java.util.Map<String, String> LABEL_DISPLAY_NAME = new java.util.LinkedHashMap<>();

    static {
        LABEL_DISPLAY_NAME.put("kemeja_benar", "Kemeja Putih (Benar)");
        LABEL_DISPLAY_NAME.put("kemeja_salah", "Kemeja (Tidak Sesuai)");
        LABEL_DISPLAY_NAME.put("kerudung_benar", "Kerudung (Benar)");
        LABEL_DISPLAY_NAME.put("kerudung_salah", "Kerudung (Tidak Sesuai)");
        LABEL_DISPLAY_NAME.put("nametag_ada", "Nametag");
        LABEL_DISPLAY_NAME.put("celana_benar", "Celana Hitam (Benar)");
        LABEL_DISPLAY_NAME.put("celana_salah", "Celana (Tidak Sesuai)");
        LABEL_DISPLAY_NAME.put("rok_benar", "Rok Hitam (Benar)");
        LABEL_DISPLAY_NAME.put("rok_salah", "Rok (Tidak Sesuai)");
        LABEL_DISPLAY_NAME.put("sabuk_ada", "Sabuk");
    }

    public AiAttributeDetector(AiDetectionClient aiDetectionClient) {
        this.aiDetectionClient = aiDetectionClient;
    }

    /**
     * Implementasi default dari interface AttributeDetector.
     * Mengembalikan list kosong karena butuh gambar untuk dideteksi.
     * Gunakan detectFromImage() untuk deteksi nyata.
     */
    @Override
    public List<Attribute> detect() {
        // Tidak ada gambar → kembalikan list atribut dengan status false semua
        List<Attribute> result = new ArrayList<>();
        for (java.util.Map.Entry<String, String> entry : LABEL_DISPLAY_NAME.entrySet()) {
            result.add(new Attribute(entry.getKey(), entry.getValue(), false));
        }
        return result;
    }

    /**
     * Deteksi atribut dari gambar yang diberikan.
     *
     * @param imageBytes byte array gambar dari upload user
     * @param filename   nama file (untuk logging)
     * @return List Attribute berisi hasil deteksi dari AI
     */
    public List<Attribute> detectFromImage(byte[] imageBytes, String filename) {
        List<Attribute> result = new ArrayList<>();

        try {
            // Kirim gambar ke Python AI server
            String jsonResponse = aiDetectionClient.detectAttributes(imageBytes, filename);
            JsonNode root = aiDetectionClient.parseResponse(jsonResponse);

            // Cek apakah ada orang yang terdeteksi
            int personsDetected = root.path("persons_detected").asInt(0);

            if (personsDetected == 0) {
                // Tidak ada orang → semua atribut false
                for (java.util.Map.Entry<String, String> entry : LABEL_DISPLAY_NAME.entrySet()) {
                    result.add(new Attribute(entry.getKey(), entry.getValue(), false));
                }
                return result;
            }

            // Ambil orang pertama yang terdeteksi (person_id = 1)
            JsonNode firstPerson = root.path("persons").get(0);
            JsonNode attributes = firstPerson.path("attributes");

            // Map setiap atribut yang diketahui
            for (java.util.Map.Entry<String, String> entry : LABEL_DISPLAY_NAME.entrySet()) {
                String label = entry.getKey();
                String displayName = entry.getValue();

                JsonNode attrNode = attributes.path(label);
                boolean detected = attrNode.path("detected").asBoolean(false);

                result.add(new Attribute(label, displayName, detected));
            }

        } catch (Exception e) {
            logger.error("[AiAttributeDetector] Error saat memanggil AI server: {}", e.getMessage());
            logger.error("[AiAttributeDetector] Pastikan AI server sudah berjalan: ai/run-ai.bat", e);

            // Fallback: kembalikan semua atribut false dengan flag error
            result.clear();
            for (java.util.Map.Entry<String, String> entry : LABEL_DISPLAY_NAME.entrySet()) {
                result.add(new Attribute(entry.getKey(), entry.getValue(), false));
            }
        }

        return result;
    }
}

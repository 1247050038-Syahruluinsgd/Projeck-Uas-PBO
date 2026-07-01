package com.timkita.app.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.UUID;

/**
 * AiDetectionClient
 *
 * Spring Service yang bertugas mengirimkan gambar (dalam bentuk byte array)
 * ke AI Python server (detection_api.py - FastAPI) lewat HTTP POST multipart/form-data,
 * dan mengembalikan respons JSON mentah dari server.
 *
 * Cara kerja:
 *   1. Menerima byte array gambar dari caller (Controller)
 *   2. Membungkusnya dalam HTTP multipart/form-data request
 *   3. Mengirim ke endpoint POST /predict di server Python (port 8000)
 *   4. Mengembalikan String JSON hasil deteksi atribut
 *
 * Syarat:
 *   - Server Python (detection_api.py) harus sudah berjalan di port 8000
 *     sebelum endpoint ini dipanggil.
 *   - Jalankan dengan: ai/run-ai.bat
 */
@Service
public class AiDetectionClient {

    @Value("${ai.detection.url:http://localhost:8000/predict}")
    private String aiApiUrl;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AiDetectionClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Kirim gambar ke AI Python server dan dapatkan JSON hasil deteksi.
     *
     * @param imageBytes  byte array gambar (JPEG/PNG)
     * @param filename    nama file gambar (untuk header multipart)
     * @return String JSON hasil deteksi dari Python, atau null jika gagal
     * @throws Exception jika request gagal atau server tidak dapat dijangkau
     */
    public String detectAttributes(byte[] imageBytes, String filename) throws Exception {
        String boundary = "Boundary-" + UUID.randomUUID().toString().replace("-", "");

        // Susun body multipart/form-data secara manual
        ByteArrayOutputStream bodyStream = new ByteArrayOutputStream();

        // Part: file
        String partHeader = "--" + boundary + "\r\n" +
                "Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"\r\n" +
                "Content-Type: image/jpeg\r\n\r\n";
        bodyStream.write(partHeader.getBytes(StandardCharsets.UTF_8));
        bodyStream.write(imageBytes);
        bodyStream.write(("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));

        byte[] requestBody = bodyStream.toByteArray();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(aiApiUrl))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofByteArray(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException(
                "AI server mengembalikan status " + response.statusCode() +
                ": " + response.body()
            );
        }

        return response.body();
    }

    /**
     * Cek apakah AI server sedang berjalan.
     *
     * @return true jika server merespons dengan status 200
     */
    public boolean isAiServerHealthy() {
        try {
            String healthUrl = aiApiUrl.replace("/predict", "/health");
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(healthUrl))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 200;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Parse JSON string hasil deteksi AI menjadi JsonNode untuk kemudahan akses.
     */
    public JsonNode parseResponse(String json) throws Exception {
        return objectMapper.readTree(json);
    }
}

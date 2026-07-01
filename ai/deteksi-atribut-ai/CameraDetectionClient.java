package com.app.service;

import java.io.File;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;

/**
 * CameraDetectionClient
 *
 * Kelas ini bertugas "menelepon" API Python (detection_api.py)
 * untuk meminta hasil deteksi dari gambar kamera.
 *
 * CARA KERJA:
 * 1. Java ambil gambar dari kamera (sudah disimpan jadi file)
 * 2. Kirim gambar itu ke server Python lewat HTTP POST
 * 3. Terima balasan dalam bentuk JSON
 * 4. (Opsional) ubah JSON jadi objek Attribute
 *
 * SYARAT:
 * - Server Python (detection_api.py) harus sudah jalan duluan
 *   di terminal/command prompt sebelum aplikasi Java di-run
 */
public class CameraDetectionClient {

    private static final String API_URL = "http://localhost:8000/detect";

    /**
     * Mengirim file gambar ke API Python dan mengembalikan
     * hasil deteksi dalam bentuk String JSON mentah.
     *
     * Contoh hasil:
     * {"detections": [{"label": "person", "confidence": 0.92}]}
     */
    public String detectFromImage(File imageFile) throws Exception {

        // Boundary untuk multipart/form-data (format upload file standar HTTP)
        String boundary = "Boundary-" + System.currentTimeMillis();

        byte[] imageBytes = Files.readAllBytes(imageFile.toPath());

        // Susun body request multipart secara manual
        var byteArrayBuilder = new java.io.ByteArrayOutputStream();
        byteArrayBuilder.write(("--" + boundary + "\r\n").getBytes());
        byteArrayBuilder.write(("Content-Disposition: form-data; name=\"file\"; filename=\""
                + imageFile.getName() + "\"\r\n").getBytes());
        byteArrayBuilder.write("Content-Type: image/jpeg\r\n\r\n".getBytes());
        byteArrayBuilder.write(imageBytes);
        byteArrayBuilder.write(("\r\n--" + boundary + "--\r\n").getBytes());

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(byteArrayBuilder.toByteArray()))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        return response.body(); // hasil JSON mentah dari Python
    }

    /**
     * Contoh cara pakai (untuk testing manual)
     */
    public static void main(String[] args) {
        try {
            CameraDetectionClient clientService = new CameraDetectionClient();
            File testImage = new File("contoh_foto.jpg"); // ganti dengan foto asli

            String hasil = clientService.detectFromImage(testImage);
            System.out.println("Hasil deteksi: " + hasil);

        } catch (Exception e) {
            System.err.println("Gagal memanggil API Python: " + e.getMessage());
            System.err.println("Pastikan detection_api.py sudah dijalankan terlebih dahulu!");
        }
    }
}

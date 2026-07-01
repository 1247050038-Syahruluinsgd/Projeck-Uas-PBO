package com.timkita.app.service;

import com.timkita.app.model.StudentRecord;
import com.timkita.app.repository.StudentRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class StudentService {

    private final StudentRecordRepository studentRecordRepository;

    public StudentService(StudentRecordRepository studentRecordRepository) {
        this.studentRecordRepository = studentRecordRepository;
    }

    /**
     * Ambil semua riwayat scan dengan filter status dan pencarian keyword.
     */
    public List<StudentRecord> getAllStudents(String status, String search) {
        String statusFilter = (status == null || status.isBlank()) ? "ALL" : status.toUpperCase();
        String searchFilter = (search == null) ? "" : search.trim();
        return studentRecordRepository.findByStatusAndSearch(statusFilter, searchFilter);
    }

    /**
     * Ambil statistik kepatuhan untuk halaman Dashboard.
     */
    public Map<String, Object> getDashboardStats() {
        Object[] results = studentRecordRepository.countDashboardStats();
        long total = 0;
        long complete = 0;
        long incomplete = 0;
        if (results != null && results.length >= 3) {
            total = ((Number) results[0]).longValue();
            complete = ((Number) results[1]).longValue();
            incomplete = ((Number) results[2]).longValue();
        }
        int rate = total > 0 ? (int) Math.round((complete * 100.0) / total) : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("complete", complete);
        stats.put("incomplete", incomplete);
        stats.put("completionRate", rate);
        return stats;
    }

    /**
     * Ambil data scan terbaru (terfilter) untuk Dashboard.
     */
    public List<StudentRecord> getRecentScans(String status, String search) {
        return getAllStudents(status, search);
    }

    /**
     * Hapus data scan berdasarkan ID.
     */
    public Map<String, Object> deleteRecord(String id) {
        Map<String, Object> response = new HashMap<>();
        if (!studentRecordRepository.existsById(id)) {
            response.put("success", false);
            response.put("message", "Data dengan ID tersebut tidak ditemukan.");
            return response;
        }
        studentRecordRepository.deleteById(id);
        response.put("success", true);
        response.put("message", "Data berhasil dihapus.");
        return response;
    }

    /**
     * Issue #7 — Mock Scanner: terima input manual atribut dan evaluasi kepatuhan.
     */
    public StudentRecord saveMockScan(Map<String, Object> payload) {
        StudentRecord record = new StudentRecord();

        record.setId(UUID.randomUUID().toString());
        record.setUserId((String) payload.getOrDefault("userId", ""));
        record.setFullName((String) payload.getOrDefault("fullName", ""));
        record.setEmail((String) payload.getOrDefault("email", ""));
        record.setProfileUrl((String) payload.getOrDefault("profileUrl", ""));

        String gender = (String) payload.getOrDefault("gender", "Male");
        record.setGender(gender);
        record.setHasHijab(Boolean.TRUE.equals(payload.get("hasHijab")));

        // Atribut bersama
        boolean hasNametag     = Boolean.TRUE.equals(payload.get("hasNametag"));
        boolean hasKemejaPutih = Boolean.TRUE.equals(payload.get("hasKemejaPutih"));
        boolean hasSabuk       = Boolean.TRUE.equals(payload.get("hasSabuk"));
        record.setHasNametag(hasNametag);
        record.setHasKemejaPutih(hasKemejaPutih);
        record.setHasSabuk(hasSabuk);

        // Atribut berdasarkan gender
        boolean hasCelanaHitam  = Boolean.TRUE.equals(payload.get("hasCelanaHitam"));
        boolean hasRokHitam     = Boolean.TRUE.equals(payload.get("hasRokHitam"));
        boolean hasKerudungPink = Boolean.TRUE.equals(payload.get("hasKerudungPink"));
        record.setHasCelanaHitam(hasCelanaHitam);
        record.setHasRokHitam(hasRokHitam);
        record.setHasKerudungPink(hasKerudungPink);

        // Evaluasi status kepatuhan
        boolean isComplete;
        if ("Female".equalsIgnoreCase(gender)) {
            isComplete = hasNametag && hasKemejaPutih && hasSabuk && hasRokHitam && hasKerudungPink;
        } else {
            isComplete = hasNametag && hasKemejaPutih && hasSabuk && hasCelanaHitam;
        }
        record.setStatus(isComplete ? "COMPLETE" : "INCOMPLETE");
        record.setCreatedAt(LocalDateTime.now());

        return studentRecordRepository.save(record);
    }
}

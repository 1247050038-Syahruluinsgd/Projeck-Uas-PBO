package com.timkita.app.controller;

import com.timkita.app.model.StudentRecord;
import com.timkita.app.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final StudentService studentService;

    public DashboardController(StudentService studentService) {
        this.studentService = studentService;
    }

    /**
     * GET /api/dashboard/stats
     * Mengembalikan statistik kepatuhan: total, complete, incomplete, completionRate.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(studentService.getDashboardStats());
    }

    /**
     * GET /api/dashboard/recent?status=ALL&search=
     * Mengembalikan daftar scan terbaru dengan filter status dan keyword pencarian.
     */
    @GetMapping("/recent")
    public ResponseEntity<List<StudentRecord>> getRecent(
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "") String search) {
        return ResponseEntity.ok(studentService.getRecentScans(status, search));
    }
}

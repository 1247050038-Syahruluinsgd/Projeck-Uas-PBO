package com.timkita.app.controller;

import com.timkita.app.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /** GET /api/admin/profile?adminId={id} */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@RequestParam Long adminId) {
        Map<String, Object> result = adminService.getProfile(adminId);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.status(404).body(result);
    }

    /** PUT /api/admin/profile?adminId={id} */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestParam Long adminId,
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> result = adminService.updateProfile(adminId, payload);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.status(404).body(result);
    }
}

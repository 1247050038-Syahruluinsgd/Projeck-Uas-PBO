package com.timkita.app.service;

import com.timkita.app.model.Admin;
import com.timkita.app.repository.AdminRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminService {

    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    /**
     * Ambil profil admin berdasarkan ID.
     */
    public Map<String, Object> getProfile(Long adminId) {
        Map<String, Object> response = new HashMap<>();
        Optional<Admin> adminOpt = adminRepository.findById(adminId);

        if (adminOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Profil admin tidak ditemukan.");
            return response;
        }

        Admin admin = adminOpt.get();
        response.put("success", true);
        response.put("id", admin.getId());
        response.put("username", admin.getUsername());
        response.put("fullName", admin.getFullName());
        response.put("role", admin.getRole());
        response.put("department", admin.getDepartment());
        response.put("avatarUrl", admin.getAvatarUrl());
        return response;
    }

    /**
     * Update profil admin: nama, role, departemen, dan avatarUrl.
     */
    public Map<String, Object> updateProfile(Long adminId, Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        Optional<Admin> adminOpt = adminRepository.findById(adminId);

        if (adminOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Profil admin tidak ditemukan.");
            return response;
        }

        Admin admin = adminOpt.get();

        if (payload.containsKey("fullName") && payload.get("fullName") != null) {
            admin.setFullName((String) payload.get("fullName"));
        }
        if (payload.containsKey("role") && payload.get("role") != null) {
            admin.setRole((String) payload.get("role"));
        }
        if (payload.containsKey("department") && payload.get("department") != null) {
            admin.setDepartment((String) payload.get("department"));
        }
        if (payload.containsKey("avatarUrl") && payload.get("avatarUrl") != null) {
            admin.setAvatarUrl((String) payload.get("avatarUrl"));
        }

        adminRepository.save(admin);

        response.put("success", true);
        response.put("message", "Profil berhasil diperbarui.");
        response.put("fullName", admin.getFullName());
        response.put("role", admin.getRole());
        response.put("department", admin.getDepartment());
        response.put("avatarUrl", admin.getAvatarUrl());
        return response;
    }
}

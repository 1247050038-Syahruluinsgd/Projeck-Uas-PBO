package com.timkita.app.controller;

import com.timkita.app.dto.*;
import com.timkita.app.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/auth/register */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        log.info(">>> [AuthController] Menerima request registrasi. Username/Email: {}, FullName: {}", 
                request.getUsername(), request.getFullName());

        Map<String, Object> result = authService.register(
                request.getUsername(), 
                request.getPassword(), 
                request.getFullName(), 
                request.getRole(), 
                request.getDepartment()
        );
        boolean success = Boolean.TRUE.equals(result.get("success"));
        log.info(">>> [AuthController] Hasil registrasi: success={}, message={}", success, result.get("message"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        log.info(">>> [AuthController] Menerima request login. Username: {}", request.getUsername());

        Map<String, Object> result = authService.login(request.getUsername(), request.getPassword());
        boolean success = Boolean.TRUE.equals(result.get("success"));
        log.info(">>> [AuthController] Hasil login: success={}, message={}", success, result.get("message"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.status(401).body(result);
    }

    /** POST /api/auth/request-otp */
    @PostMapping("/request-otp")
    public ResponseEntity<Map<String, Object>> requestOtp(@Valid @RequestBody RequestOtpRequest request) {
        log.info(">>> [AuthController] Menerima request OTP. Username/Email: {}", request.getUsername());
        
        Map<String, Object> result = authService.requestOtp(request.getUsername());
        boolean success = Boolean.TRUE.equals(result.get("success"));
        log.info(">>> [AuthController] Hasil request OTP: success={}, message={}", success, result.get("message"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    /** POST /api/auth/verify-otp */
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        log.info(">>> [AuthController] Menerima verifikasi OTP. Username/Email: {}, Kode OTP: {}", 
                request.getUsername(), request.getOtp());

        Map<String, Object> result = authService.verifyOtp(request.getUsername(), request.getOtp());
        boolean success = Boolean.TRUE.equals(result.get("success"));
        log.info(">>> [AuthController] Hasil verifikasi OTP: success={}, message={}", success, result.get("message"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    /** POST /api/auth/reset-password */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info(">>> [AuthController] Menerima request reset password. Username/Email: {}", request.getUsername());

        Map<String, Object> result = authService.resetPassword(request.getUsername(), request.getOtp(), request.getNewPassword());
        boolean success = Boolean.TRUE.equals(result.get("success"));
        log.info(">>> [AuthController] Hasil reset password: success={}, message={}", success, result.get("message"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }
}

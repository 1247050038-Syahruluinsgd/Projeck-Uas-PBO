package com.timkita.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    @NotBlank(message = "Username/Email wajib diisi")
    @Email(message = "Format email tidak valid")
    private String username;

    @NotBlank(message = "OTP wajib diisi")
    @Size(min = 6, max = 6, message = "OTP harus 6 karakter")
    private String otp;

    @NotBlank(message = "Password baru wajib diisi")
    @Size(min = 6, message = "Password baru minimal 6 karakter")
    private String newPassword;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}

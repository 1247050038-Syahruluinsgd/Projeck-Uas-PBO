package com.timkita.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VerifyOtpRequest {

    @NotBlank(message = "Username/Email wajib diisi")
    @Email(message = "Format email tidak valid")
    private String username;

    @NotBlank(message = "OTP wajib diisi")
    @Size(min = 6, max = 6, message = "OTP harus 6 karakter")
    private String otp;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}

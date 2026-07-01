package com.timkita.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RequestOtpRequest {

    @NotBlank(message = "Username/Email wajib diisi")
    @Email(message = "Format email tidak valid")
    private String username;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}

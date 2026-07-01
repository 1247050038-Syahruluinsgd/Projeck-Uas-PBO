package com.timkita.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class WhatsAppRequest {

    @NotBlank(message = "Nomor tujuan WhatsApp wajib diisi")
    @Pattern(regexp = "^\\d{9,15}$", message = "Format nomor WhatsApp tidak valid (harus 9-15 digit angka)")
    private String target;

    @NotBlank(message = "Pesan WhatsApp wajib diisi")
    private String message;

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

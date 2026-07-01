package com.timkita.app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_records")
public class StudentRecord {

    @Id
    private String id;

    @Column(nullable = false)
    private String userId;   // NIM Mahasiswa

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String gender;   // MALE / FEMALE

    private boolean hasHijab;

    @Column(nullable = false)
    private String status;   // COMPLETE / INCOMPLETE

    @Column(length = 2048)
    private String profileUrl;

    // Atribut Bersama
    private boolean hasNametag;
    private boolean hasKemejaPutih;
    private boolean hasSabuk;

    // Khusus Male
    private boolean hasCelanaHitam;

    // Khusus Female
    private boolean hasRokHitam;
    private boolean hasKerudungPink;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public StudentRecord() {}

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public boolean isHasHijab() { return hasHijab; }
    public void setHasHijab(boolean hasHijab) { this.hasHijab = hasHijab; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getProfileUrl() { return profileUrl; }
    public void setProfileUrl(String profileUrl) { this.profileUrl = profileUrl; }

    public boolean isHasNametag() { return hasNametag; }
    public void setHasNametag(boolean hasNametag) { this.hasNametag = hasNametag; }

    public boolean isHasKemejaPutih() { return hasKemejaPutih; }
    public void setHasKemejaPutih(boolean hasKemejaPutih) { this.hasKemejaPutih = hasKemejaPutih; }

    public boolean isHasSabuk() { return hasSabuk; }
    public void setHasSabuk(boolean hasSabuk) { this.hasSabuk = hasSabuk; }

    public boolean isHasCelanaHitam() { return hasCelanaHitam; }
    public void setHasCelanaHitam(boolean hasCelanaHitam) { this.hasCelanaHitam = hasCelanaHitam; }

    public boolean isHasRokHitam() { return hasRokHitam; }
    public void setHasRokHitam(boolean hasRokHitam) { this.hasRokHitam = hasRokHitam; }

    public boolean isHasKerudungPink() { return hasKerudungPink; }
    public void setHasKerudungPink(boolean hasKerudungPink) { this.hasKerudungPink = hasKerudungPink; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

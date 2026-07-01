package com.timkita.app.model;
import java.util.Objects;

public class Attribute {

    private String code;
    private String name;
    private boolean required;   // apakah atribut ini wajib dipakai
    private boolean detected;   // apakah AI berhasil mendeteksi atribut ini di foto

    public Attribute() {
    }

    /** Constructor dengan status detected dari AI */
    public Attribute(String code, String name, boolean detected) {
        this.code = code;
        this.name = name;
        this.required = true;
        this.detected = detected;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }

    public boolean isDetected() {
        return detected;
    }

    public void setDetected(boolean detected) {
        this.detected = detected;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Attribute)) return false;
        Attribute attribute = (Attribute) o;
        return Objects.equals(code, attribute.code);
    }

    @Override
    public int hashCode() {
        return Objects.hash(code);
    }

    @Override
    public String toString() {
        return "Attribute{" +
                "code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", required=" + required +
                ", detected=" + detected +
                '}';
    }
}
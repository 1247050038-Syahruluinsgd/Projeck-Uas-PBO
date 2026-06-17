package com.timkita.app.model;
import java.util.Objects;

public class Attribute {

    private String code;
    private String name;
    private boolean required;

    public Attribute() {
    }

    public Attribute(String code, String name, boolean required) {
        this.code = code;
        this.name = name;
        this.required = required;
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
                '}';
    }
}
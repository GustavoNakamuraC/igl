package com.igl.grenade;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum GrenadeSide {
    CT("ct"), TR("tr"), BOTH("both");

    private final String value;

    GrenadeSide(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static GrenadeSide fromValue(String value) {
        for (GrenadeSide t : values()) {
            if (t.value.equals(value)) return t;
        }
        throw new IllegalArgumentException("Lado inválido: " + value);
    }
}

package com.igl.position;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Lado de uma posição: só CT ou TR (diferente da granada, que aceita "both"). */
public enum TeamSide {
    CT("ct"), TR("tr");

    private final String value;

    TeamSide(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static TeamSide fromValue(String value) {
        for (TeamSide s : values()) {
            if (s.value.equals(value)) return s;
        }
        throw new IllegalArgumentException("Lado inválido: " + value);
    }
}

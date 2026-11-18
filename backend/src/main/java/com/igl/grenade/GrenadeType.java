package com.igl.grenade;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum GrenadeType {
    SMOKE("smoke"), MOLOTOV("molotov"), FLASH("flash"), HE("he");

    private final String value;

    GrenadeType(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static GrenadeType fromValue(String value) {
        for (GrenadeType t : values()) {
            if (t.value.equals(value)) return t;
        }
        throw new IllegalArgumentException("Tipo de granada inválido: " + value);
    }
}

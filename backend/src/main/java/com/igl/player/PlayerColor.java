package com.igl.player;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PlayerColor {
    BLUE("blue"), YELLOW("yellow"), GREEN("green"), ORANGE("orange"), PURPLE("purple");

    private final String value;

    PlayerColor(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static PlayerColor fromValue(String value) {
        for (PlayerColor c : values()) {
            if (c.value.equals(value)) return c;
        }
        throw new IllegalArgumentException("Cor inválida: " + value);
    }
}

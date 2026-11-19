package com.igl.player;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PlayerColorConverter implements AttributeConverter<PlayerColor, String> {
    @Override
    public String convertToDatabaseColumn(PlayerColor color) {
        return color == null ? null : color.value();
    }

    @Override
    public PlayerColor convertToEntityAttribute(String value) {
        return value == null ? null : PlayerColor.fromValue(value);
    }
}

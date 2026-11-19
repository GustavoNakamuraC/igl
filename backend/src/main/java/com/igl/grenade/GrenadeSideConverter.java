package com.igl.grenade;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class GrenadeSideConverter implements AttributeConverter<GrenadeSide, String> {
    @Override
    public String convertToDatabaseColumn(GrenadeSide side) {
        return side == null ? null : side.value();
    }

    @Override
    public GrenadeSide convertToEntityAttribute(String value) {
        return value == null ? null : GrenadeSide.fromValue(value);
    }
}

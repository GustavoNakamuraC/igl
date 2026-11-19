package com.igl.position;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TeamSideConverter implements AttributeConverter<TeamSide, String> {
    @Override
    public String convertToDatabaseColumn(TeamSide side) {
        return side == null ? null : side.value();
    }

    @Override
    public TeamSide convertToEntityAttribute(String value) {
        return value == null ? null : TeamSide.fromValue(value);
    }
}

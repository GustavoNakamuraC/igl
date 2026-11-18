package com.igl.grenade;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class GrenadeTypeConverter implements AttributeConverter<GrenadeType, String> {
    @Override
    public String convertToDatabaseColumn(GrenadeType type) {
        return type == null ? null : type.value();
    }

    @Override
    public GrenadeType convertToEntityAttribute(String value) {
        return value == null ? null : GrenadeType.fromValue(value);
    }
}

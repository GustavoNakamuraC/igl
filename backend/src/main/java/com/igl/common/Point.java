package com.igl.common;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

/** Coordenada normalizada (0 a 1) em relação à imagem do mapa. */
public record Point(
        @DecimalMin("0.0") @DecimalMax("1.0") double x,
        @DecimalMin("0.0") @DecimalMax("1.0") double y) {
}

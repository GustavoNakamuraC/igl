package com.igl.grenade;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.UUID;

public final class GrenadeDtos {
    private GrenadeDtos() {
    }

    public record PointInput(
            @DecimalMin("0.0") @DecimalMax("1.0") double x,
            @DecimalMin("0.0") @DecimalMax("1.0") double y,
            @Size(max = 80) String label) {

        ThrowPoint toEntity() {
            String trimmed = label == null ? null : label.trim();
            return new ThrowPoint(x, y, trimmed == null || trimmed.isEmpty() ? null : trimmed);
        }

        static PointInput from(ThrowPoint p) {
            return new PointInput(p.getX(), p.getY(), p.getLabel());
        }
    }

    public record GrenadeInput(
            @NotNull GrenadeType type,
            @NotNull @Valid PointInput start,
            @NotNull @Valid PointInput end,
            @NotBlank @Size(max = 4000) String howTo) {
    }

    public record GrenadeResponse(UUID id, String mapSlug, GrenadeType type, PointInput start, PointInput end,
                                  String howTo, Instant createdAt, Instant updatedAt) {
        public static GrenadeResponse from(Grenade g) {
            return new GrenadeResponse(g.getId(), g.getMapSlug(), g.getType(), PointInput.from(g.getStart()),
                    PointInput.from(g.getEnd()), g.getHowTo(), g.getCreatedAt(), g.getUpdatedAt());
        }
    }
}

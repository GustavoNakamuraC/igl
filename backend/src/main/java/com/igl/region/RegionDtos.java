package com.igl.region;

import com.igl.common.Point;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class RegionDtos {
    private RegionDtos() {
    }

    public record RegionInput(
            @NotBlank @Size(max = 80) String name,
            @NotNull @Size(min = 3, message = "o polígono precisa de pelo menos 3 pontos") List<@Valid @NotNull Point> points) {
    }

    public record RegionResponse(UUID id, String mapSlug, String name, List<Point> points,
                                 Instant createdAt, Instant updatedAt) {
        public static RegionResponse from(Region r) {
            return new RegionResponse(r.getId(), r.getMapSlug(), r.getName(), List.copyOf(r.getPoints()),
                    r.getCreatedAt(), r.getUpdatedAt());
        }
    }
}

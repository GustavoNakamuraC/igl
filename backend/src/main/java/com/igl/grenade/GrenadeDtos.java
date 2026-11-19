package com.igl.grenade;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import com.igl.player.Player;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
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
            @NotBlank @Size(max = 4000) String howTo,
            @Size(max = 4000) String notes,
            @Size(max = 10) List<@NotNull UUID> playerIds,
            @Size(max = 10, message = "no máximo 10 imagens por granada") List<@NotNull UUID> imageIds) {

        public List<UUID> playerIdsOrEmpty() {
            return playerIds == null ? List.of() : playerIds.stream().distinct().toList();
        }

        public List<UUID> imageIdsOrEmpty() {
            return imageIds == null ? List.of() : imageIds.stream().distinct().toList();
        }
    }

    public record GrenadeResponse(UUID id, String mapSlug, GrenadeType type, PointInput start, PointInput end,
                                  String howTo, String notes, List<UUID> playerIds, List<UUID> imageIds,
                                  Instant createdAt, Instant updatedAt) {
        public static GrenadeResponse from(Grenade g) {
            List<UUID> players = g.getPlayers().stream()
                    .sorted(Comparator.comparing(Player::getCreatedAt))
                    .map(Player::getId)
                    .toList();
            return new GrenadeResponse(g.getId(), g.getMapSlug(), g.getType(), PointInput.from(g.getStart()),
                    PointInput.from(g.getEnd()), g.getHowTo(), g.getNotes(), players, List.copyOf(g.getImageIds()),
                    g.getCreatedAt(), g.getUpdatedAt());
        }
    }
}

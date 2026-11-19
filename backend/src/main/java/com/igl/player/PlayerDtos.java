package com.igl.player;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public final class PlayerDtos {
    private PlayerDtos() {
    }

    public record PlayerInput(
            @NotBlank @Size(max = 40) String name,
            @Size(max = 40) String role,
            @Size(max = 2000) String notes,
            @NotNull PlayerColor color,
            UUID photoId) {
    }

    public record PlayerResponse(UUID id, String name, String role, String notes, PlayerColor color, UUID photoId,
                                 Instant createdAt, Instant updatedAt) {
        public static PlayerResponse from(Player p) {
            return new PlayerResponse(p.getId(), p.getName(), p.getRole(), p.getNotes(), p.getColor(), p.getPhotoId(),
                    p.getCreatedAt(), p.getUpdatedAt());
        }
    }
}

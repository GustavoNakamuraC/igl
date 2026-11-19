package com.igl.position;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public final class PositionDtos {
    private PositionDtos() {
    }

    public record PositionInput(@NotNull UUID playerId, @NotNull UUID regionId, @NotNull TeamSide side) {
    }

    public record PositionResponse(UUID id, UUID playerId, UUID regionId, TeamSide side, Instant createdAt) {
        public static PositionResponse from(PlayerPosition p) {
            return new PositionResponse(p.getId(), p.getPlayerId(), p.getRegionId(), p.getSide(), p.getCreatedAt());
        }
    }

    /** Posição com mapa e nome da região, para o modal do jogador. */
    public record PlayerPositionView(UUID id, String mapSlug, UUID regionId, String regionName, TeamSide side) {
    }
}

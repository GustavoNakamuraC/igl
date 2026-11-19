package com.igl.backup;

import com.igl.grenade.GrenadeDtos.GrenadeResponse;
import com.igl.player.PlayerDtos.PlayerResponse;
import com.igl.region.RegionDtos.RegionResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Formato do arquivo de backup (exportar/importar tudo em JSON).
 * v1: regiões e granadas. v2: + jogadores, vínculos e imagens (base64).
 */
public record BackupData(
        int version,
        Instant exportedAt,
        @NotNull List<@Valid @NotNull RegionResponse> regions,
        @NotNull List<@Valid @NotNull GrenadeResponse> grenades,
        List<@Valid @NotNull PlayerResponse> players,
        List<@Valid @NotNull ImageData> images) {

    public static final int CURRENT_VERSION = 2;

    /** Imagem embutida no backup; {@code data} é serializado em base64 pelo Jackson. */
    public record ImageData(@NotNull UUID id, @NotNull String contentType, @NotNull byte[] data) {
    }

    public List<PlayerResponse> playersOrEmpty() {
        return players == null ? List.of() : players;
    }

    public List<ImageData> imagesOrEmpty() {
        return images == null ? List.of() : images;
    }
}

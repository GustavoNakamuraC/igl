package com.igl.backup;

import com.igl.grenade.GrenadeDtos.GrenadeResponse;
import com.igl.region.RegionDtos.RegionResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

/** Formato do arquivo de backup (exportar/importar tudo em JSON). */
public record BackupData(
        int version,
        Instant exportedAt,
        @NotNull List<@Valid @NotNull RegionResponse> regions,
        @NotNull List<@Valid @NotNull GrenadeResponse> grenades) {

    public static final int CURRENT_VERSION = 1;
}

package com.igl.backup;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.igl.grenade.GrenadeDtos.GrenadeResponse;
import com.igl.grenade.GrenadeRepository;
import com.igl.map.MapSlug;
import com.igl.region.RegionDtos.RegionResponse;
import com.igl.region.RegionRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class BackupService {

    private final RegionRepository regions;
    private final GrenadeRepository grenades;
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;

    public BackupService(RegionRepository regions, GrenadeRepository grenades, JdbcTemplate jdbc, ObjectMapper json) {
        this.regions = regions;
        this.grenades = grenades;
        this.jdbc = jdbc;
        this.json = json;
    }

    @Transactional(readOnly = true)
    public BackupData export() {
        List<RegionResponse> r = regions.findAll().stream().map(RegionResponse::from)
                .sorted(Comparator.comparing(RegionResponse::createdAt)).toList();
        List<GrenadeResponse> g = grenades.findAll().stream().map(GrenadeResponse::from)
                .sorted(Comparator.comparing(GrenadeResponse::createdAt)).toList();
        return new BackupData(BackupData.CURRENT_VERSION, Instant.now(), r, g);
    }

    /** Substitui todos os dados pelos do backup. Tudo ou nada (transacional). */
    @Transactional
    public void importAll(BackupData data) {
        data.regions().forEach(r -> MapSlug.require(r.mapSlug()));
        data.grenades().forEach(g -> MapSlug.require(g.mapSlug()));

        jdbc.update("delete from grenades");
        jdbc.update("delete from regions");

        Instant now = Instant.now();
        for (RegionResponse r : data.regions()) {
            jdbc.update("""
                            insert into regions (id, map_slug, name, points, created_at, updated_at)
                            values (?, ?, ?, ?::jsonb, ?, ?)""",
                    idOrNew(r.id()), r.mapSlug(), r.name(), toJson(r.points()),
                    ts(r.createdAt(), now), ts(r.updatedAt(), now));
        }
        for (GrenadeResponse g : data.grenades()) {
            jdbc.update("""
                            insert into grenades (id, map_slug, type, start_x, start_y, start_label,
                                                  end_x, end_y, end_label, how_to, created_at, updated_at)
                            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    idOrNew(g.id()), g.mapSlug(), g.type().value(),
                    g.start().x(), g.start().y(), g.start().label(),
                    g.end().x(), g.end().y(), g.end().label(),
                    g.howTo(), ts(g.createdAt(), now), ts(g.updatedAt(), now));
        }
    }

    private static UUID idOrNew(UUID id) {
        return id != null ? id : UUID.randomUUID();
    }

    private static Timestamp ts(Instant value, Instant fallback) {
        return Timestamp.from(value != null ? value : fallback);
    }

    private String toJson(Object value) {
        try {
            return json.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }

}

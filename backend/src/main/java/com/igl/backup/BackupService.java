package com.igl.backup;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.igl.backup.BackupData.ImageData;
import com.igl.grenade.GrenadeDtos.GrenadeResponse;
import com.igl.grenade.GrenadeRepository;
import com.igl.grenade.GrenadeSide;
import com.igl.image.ImageRepository;
import com.igl.common.BadRequestException;
import com.igl.map.MapSlug;
import com.igl.player.PlayerDtos.PlayerResponse;
import com.igl.player.PlayerRepository;
import com.igl.region.RegionDtos.RegionResponse;
import com.igl.region.RegionRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BackupService {

    private final RegionRepository regions;
    private final GrenadeRepository grenades;
    private final PlayerRepository players;
    private final ImageRepository images;
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;

    public BackupService(RegionRepository regions, GrenadeRepository grenades, PlayerRepository players,
                         ImageRepository images, JdbcTemplate jdbc, ObjectMapper json) {
        this.regions = regions;
        this.grenades = grenades;
        this.players = players;
        this.images = images;
        this.jdbc = jdbc;
        this.json = json;
    }

    @Transactional(readOnly = true)
    public BackupData export() {
        List<RegionResponse> r = regions.findAll().stream().map(RegionResponse::from)
                .sorted(Comparator.comparing(RegionResponse::createdAt)).toList();
        List<GrenadeResponse> g = grenades.findAllByOrderByCreatedAtAsc().stream().map(GrenadeResponse::from).toList();
        List<PlayerResponse> p = players.findAllByOrderByCreatedAtAsc().stream().map(PlayerResponse::from).toList();
        List<ImageData> i = images.findAll().stream()
                .sorted(Comparator.comparing(com.igl.image.Image::getCreatedAt))
                .map(img -> new ImageData(img.getId(), img.getContentType(), img.getData()))
                .toList();
        return new BackupData(BackupData.CURRENT_VERSION, Instant.now(), r, g, p, i);
    }

    /** Substitui todos os dados pelos do backup. Tudo ou nada (transacional). Aceita v1 e v2. */
    @Transactional
    public void importAll(BackupData data) {
        validate(data);

        // Vínculos (player_grenades, grenade_images) caem em cascata.
        jdbc.update("delete from grenades");
        jdbc.update("delete from players");
        jdbc.update("delete from regions");
        jdbc.update("delete from images");

        Instant now = Instant.now();
        for (ImageData img : data.imagesOrEmpty()) {
            jdbc.update("insert into images (id, content_type, data, size_bytes) values (?, ?, ?, ?)",
                    img.id(), img.contentType(), img.data(), img.data().length);
        }
        for (PlayerResponse p : data.playersOrEmpty()) {
            jdbc.update("""
                            insert into players (id, name, role, notes, color, photo_id, created_at, updated_at)
                            values (?, ?, ?, ?, ?, ?, ?, ?)""",
                    p.id(), p.name(), p.role(), p.notes(), p.color().value(), p.photoId(),
                    ts(p.createdAt(), now), ts(p.updatedAt(), now));
        }
        for (RegionResponse r : data.regions()) {
            jdbc.update("""
                            insert into regions (id, map_slug, name, points, created_at, updated_at)
                            values (?, ?, ?, ?::jsonb, ?, ?)""",
                    idOrNew(r.id()), r.mapSlug(), r.name(), toJson(r.points()),
                    ts(r.createdAt(), now), ts(r.updatedAt(), now));
        }
        for (GrenadeResponse g : data.grenades()) {
            UUID id = idOrNew(g.id());
            jdbc.update("""
                            insert into grenades (id, map_slug, type, side, start_x, start_y, start_label,
                                                  end_x, end_y, end_label, how_to, notes, created_at, updated_at)
                            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    id, g.mapSlug(), g.type().value(),
                    // Backups anteriores ao lado CT/TR não têm o campo.
                    (g.side() != null ? g.side() : GrenadeSide.BOTH).value(),
                    g.start().x(), g.start().y(), g.start().label(),
                    g.end().x(), g.end().y(), g.end().label(),
                    g.howTo(), g.notes(), ts(g.createdAt(), now), ts(g.updatedAt(), now));
            for (UUID playerId : orEmpty(g.playerIds()).stream().distinct().toList()) {
                jdbc.update("insert into player_grenades (player_id, grenade_id) values (?, ?)", playerId, id);
            }
            List<UUID> imageIds = orEmpty(g.imageIds());
            for (int pos = 0; pos < imageIds.size(); pos++) {
                jdbc.update("insert into grenade_images (grenade_id, image_id, position) values (?, ?, ?)",
                        id, imageIds.get(pos), pos);
            }
        }
    }

    private static void validate(BackupData data) {
        data.regions().forEach(r -> MapSlug.require(r.mapSlug()));
        data.grenades().forEach(g -> MapSlug.require(g.mapSlug()));

        Set<UUID> imageIds = data.imagesOrEmpty().stream().map(ImageData::id).collect(Collectors.toSet());
        Set<UUID> playerIds = new HashSet<>();
        for (PlayerResponse p : data.playersOrEmpty()) {
            if (p.id() == null || p.name() == null || p.color() == null) {
                throw new InvalidBackupException("Jogador incompleto no backup");
            }
            playerIds.add(p.id());
            if (p.photoId() != null && !imageIds.contains(p.photoId())) {
                throw new InvalidBackupException("Foto do jogador " + p.name() + " não está no backup");
            }
        }
        for (GrenadeResponse g : data.grenades()) {
            if (!playerIds.containsAll(orEmpty(g.playerIds()))) {
                throw new InvalidBackupException("Granada referencia jogador que não está no backup");
            }
            if (!imageIds.containsAll(orEmpty(g.imageIds()))) {
                throw new InvalidBackupException("Granada referencia imagem que não está no backup");
            }
        }
    }

    private static <T> List<T> orEmpty(List<T> list) {
        return list == null ? List.of() : list;
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

    /** Erro de conteúdo do arquivo de backup (vira 400). */
    public static class InvalidBackupException extends BadRequestException {
        public InvalidBackupException(String message) {
            super(message);
        }
    }
}

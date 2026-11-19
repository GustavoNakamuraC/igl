package com.igl.player;

import com.igl.common.NotFoundException;
import com.igl.image.ImageService;
import com.igl.player.PlayerDtos.PlayerInput;
import com.igl.player.PlayerDtos.PlayerResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@Transactional
public class PlayerService {

    private final PlayerRepository repository;
    private final ImageService images;

    public PlayerService(PlayerRepository repository, ImageService images) {
        this.repository = repository;
        this.images = images;
    }

    @Transactional(readOnly = true)
    public List<PlayerResponse> list() {
        return repository.findAllByOrderByCreatedAtAsc().stream().map(PlayerResponse::from).toList();
    }

    /** Quantas granadas o jogador sabe, por mapa (slug → total). */
    @Transactional(readOnly = true)
    public Map<String, Long> grenadeCounts(UUID id) {
        find(id);
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Object[] row : repository.countGrenadesByMap(id)) {
            counts.put((String) row[0], ((Number) row[1]).longValue());
        }
        return counts;
    }

    public PlayerResponse create(PlayerInput input) {
        Player player = new Player();
        apply(player, input);
        return PlayerResponse.from(repository.saveAndFlush(player));
    }

    public PlayerResponse update(UUID id, PlayerInput input) {
        Player player = find(id);
        UUID oldPhoto = player.getPhotoId();
        apply(player, input);
        repository.saveAndFlush(player);
        if (oldPhoto != null && !Objects.equals(oldPhoto, player.getPhotoId())) {
            images.deleteIfOrphan(List.of(oldPhoto));
        }
        return PlayerResponse.from(player);
    }

    /** Exclui o jogador; os vínculos com granadas somem (cascade), as granadas ficam. */
    public void delete(UUID id) {
        Player player = find(id);
        UUID photo = player.getPhotoId();
        repository.delete(player);
        repository.flush();
        if (photo != null) images.deleteIfOrphan(List.of(photo));
    }

    private Player find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Jogador", id));
    }

    private void apply(Player player, PlayerInput input) {
        if (input.photoId() != null) images.requireAllExist(List.of(input.photoId()));
        player.setName(input.name().trim());
        player.setRole(blankToNull(input.role()));
        player.setSecondaryRole(blankToNull(input.secondaryRole()));
        player.setNotes(blankToNull(input.notes()));
        player.setColor(input.color());
        player.setPhotoId(input.photoId());
    }

    static String blankToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}

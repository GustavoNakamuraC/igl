package com.igl.grenade;

import com.igl.common.NotFoundException;
import com.igl.grenade.GrenadeDtos.GrenadeInput;
import com.igl.grenade.GrenadeDtos.GrenadeResponse;
import com.igl.image.ImageService;
import com.igl.map.MapSlug;
import com.igl.player.Player;
import com.igl.player.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class GrenadeService {

    private final GrenadeRepository repository;
    private final PlayerRepository players;
    private final ImageService images;

    public GrenadeService(GrenadeRepository repository, PlayerRepository players, ImageService images) {
        this.repository = repository;
        this.players = players;
        this.images = images;
    }

    @Transactional(readOnly = true)
    public List<GrenadeResponse> list(String mapSlug) {
        MapSlug.require(mapSlug);
        return repository.findByMapSlugOrderByCreatedAtAsc(mapSlug).stream().map(GrenadeResponse::from).toList();
    }

    public GrenadeResponse create(String mapSlug, GrenadeInput input) {
        Grenade grenade = new Grenade();
        grenade.setMapSlug(MapSlug.require(mapSlug));
        apply(grenade, input);
        return GrenadeResponse.from(repository.saveAndFlush(grenade));
    }

    public GrenadeResponse update(UUID id, GrenadeInput input) {
        Grenade grenade = find(id);
        List<UUID> oldImages = new ArrayList<>(grenade.getImageIds());
        apply(grenade, input);
        repository.saveAndFlush(grenade);
        oldImages.removeAll(grenade.getImageIds());
        images.deleteIfOrphan(oldImages);
        return GrenadeResponse.from(grenade);
    }

    public void delete(UUID id) {
        Grenade grenade = find(id);
        List<UUID> oldImages = new ArrayList<>(grenade.getImageIds());
        repository.delete(grenade);
        repository.flush();
        images.deleteIfOrphan(oldImages);
    }

    private Grenade find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Granada", id));
    }

    private void apply(Grenade grenade, GrenadeInput input) {
        List<UUID> playerIds = input.playerIdsOrEmpty();
        List<Player> found = players.findAllById(playerIds);
        if (found.size() != playerIds.size()) {
            UUID missing = playerIds.stream()
                    .filter(id -> found.stream().noneMatch(p -> p.getId().equals(id)))
                    .findFirst().orElseThrow();
            throw new NotFoundException("Jogador", missing);
        }
        List<UUID> imageIds = input.imageIdsOrEmpty();
        images.requireAllExist(imageIds);

        grenade.setType(input.type());
        grenade.setSide(input.side());
        grenade.setStart(input.start().toEntity());
        grenade.setEnd(input.end().toEntity());
        grenade.setHowTo(input.howTo().trim());
        String notes = input.notes() == null ? null : input.notes().trim();
        grenade.setNotes(notes == null || notes.isEmpty() ? null : notes);
        grenade.setPlayers(new LinkedHashSet<>(found));
        grenade.setImageIds(imageIds);
    }
}

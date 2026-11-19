package com.igl.grenade;

import com.igl.common.NotFoundException;
import com.igl.grenade.GrenadeDtos.GrenadeInput;
import com.igl.grenade.GrenadeDtos.GrenadeResponse;
import com.igl.map.MapSlug;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class GrenadeService {

    private final GrenadeRepository repository;

    public GrenadeService(GrenadeRepository repository) {
        this.repository = repository;
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
        Grenade grenade = repository.findById(id).orElseThrow(() -> new NotFoundException("Granada", id));
        apply(grenade, input);
        return GrenadeResponse.from(repository.saveAndFlush(grenade));
    }

    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Granada", id);
        }
        repository.deleteById(id);
    }

    private static void apply(Grenade grenade, GrenadeInput input) {
        grenade.setType(input.type());
        grenade.setStart(input.start().toEntity());
        grenade.setEnd(input.end().toEntity());
        grenade.setHowTo(input.howTo().trim());
    }
}

package com.igl.region;

import com.igl.common.NotFoundException;
import com.igl.map.MapSlug;
import com.igl.region.RegionDtos.RegionInput;
import com.igl.region.RegionDtos.RegionResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class RegionService {

    private final RegionRepository repository;

    public RegionService(RegionRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<RegionResponse> list(String mapSlug) {
        MapSlug.require(mapSlug);
        return repository.findByMapSlugOrderByCreatedAtAsc(mapSlug).stream().map(RegionResponse::from).toList();
    }

    public RegionResponse create(String mapSlug, RegionInput input) {
        Region region = new Region();
        region.setMapSlug(MapSlug.require(mapSlug));
        apply(region, input);
        return RegionResponse.from(repository.saveAndFlush(region));
    }

    public RegionResponse update(UUID id, RegionInput input) {
        Region region = repository.findById(id).orElseThrow(() -> new NotFoundException("Região", id));
        apply(region, input);
        return RegionResponse.from(repository.saveAndFlush(region));
    }

    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Região", id);
        }
        repository.deleteById(id);
    }

    private static void apply(Region region, RegionInput input) {
        region.setName(input.name().trim());
        region.setPoints(input.points());
    }
}

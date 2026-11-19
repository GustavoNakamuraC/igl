package com.igl.region;

import com.igl.region.RegionDtos.RegionInput;
import com.igl.region.RegionDtos.RegionResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class RegionController {

    private final RegionService service;

    public RegionController(RegionService service) {
        this.service = service;
    }

    @GetMapping("/maps/{slug}/regions")
    public List<RegionResponse> list(@PathVariable String slug) {
        return service.list(slug);
    }

    @PostMapping("/maps/{slug}/regions")
    @ResponseStatus(HttpStatus.CREATED)
    public RegionResponse create(@PathVariable String slug, @Valid @RequestBody RegionInput input) {
        return service.create(slug, input);
    }

    @PutMapping("/regions/{id}")
    public RegionResponse update(@PathVariable UUID id, @Valid @RequestBody RegionInput input) {
        return service.update(id, input);
    }

    @DeleteMapping("/regions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}

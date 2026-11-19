package com.igl.grenade;

import com.igl.grenade.GrenadeDtos.GrenadeInput;
import com.igl.grenade.GrenadeDtos.GrenadeResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class GrenadeController {

    private final GrenadeService service;

    public GrenadeController(GrenadeService service) {
        this.service = service;
    }

    @GetMapping("/maps/{slug}/grenades")
    public List<GrenadeResponse> list(@PathVariable String slug) {
        return service.list(slug);
    }

    @PostMapping("/maps/{slug}/grenades")
    @ResponseStatus(HttpStatus.CREATED)
    public GrenadeResponse create(@PathVariable String slug, @Valid @RequestBody GrenadeInput input) {
        return service.create(slug, input);
    }

    @PutMapping("/grenades/{id}")
    public GrenadeResponse update(@PathVariable UUID id, @Valid @RequestBody GrenadeInput input) {
        return service.update(id, input);
    }

    @DeleteMapping("/grenades/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}

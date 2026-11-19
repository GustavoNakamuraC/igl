package com.igl.player;

import com.igl.player.PlayerDtos.PlayerInput;
import com.igl.player.PlayerDtos.PlayerResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService service;

    public PlayerController(PlayerService service) {
        this.service = service;
    }

    @GetMapping
    public List<PlayerResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}/grenade-counts")
    public Map<String, Long> grenadeCounts(@PathVariable UUID id) {
        return service.grenadeCounts(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PlayerResponse create(@Valid @RequestBody PlayerInput input) {
        return service.create(input);
    }

    @PutMapping("/{id}")
    public PlayerResponse update(@PathVariable UUID id, @Valid @RequestBody PlayerInput input) {
        return service.update(id, input);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}

package com.igl.position;

import com.igl.position.PositionDtos.PlayerPositionView;
import com.igl.position.PositionDtos.PositionInput;
import com.igl.position.PositionDtos.PositionResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PositionController {

    private final PositionService service;

    public PositionController(PositionService service) {
        this.service = service;
    }

    @GetMapping("/maps/{slug}/positions")
    public List<PositionResponse> listByMap(@PathVariable String slug) {
        return service.listByMap(slug);
    }

    @GetMapping("/players/{id}/positions")
    public List<PlayerPositionView> listByPlayer(@PathVariable UUID id) {
        return service.listByPlayer(id);
    }

    @PostMapping("/positions")
    @ResponseStatus(HttpStatus.CREATED)
    public PositionResponse create(@Valid @RequestBody PositionInput input) {
        return service.create(input);
    }

    @DeleteMapping("/positions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}

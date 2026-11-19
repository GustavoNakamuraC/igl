package com.igl.position;

import com.igl.common.ConflictException;
import com.igl.common.NotFoundException;
import com.igl.map.MapSlug;
import com.igl.player.PlayerRepository;
import com.igl.position.PositionDtos.PlayerPositionView;
import com.igl.position.PositionDtos.PositionInput;
import com.igl.position.PositionDtos.PositionResponse;
import com.igl.region.RegionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PositionService {

    private final PositionRepository repository;
    private final PlayerRepository players;
    private final RegionRepository regions;

    public PositionService(PositionRepository repository, PlayerRepository players, RegionRepository regions) {
        this.repository = repository;
        this.players = players;
        this.regions = regions;
    }

    @Transactional(readOnly = true)
    public List<PositionResponse> listByMap(String mapSlug) {
        MapSlug.require(mapSlug);
        return repository.findByMapSlug(mapSlug).stream().map(PositionResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<PlayerPositionView> listByPlayer(UUID playerId) {
        if (!players.existsById(playerId)) throw new NotFoundException("Jogador", playerId);
        return repository.findViewsByPlayer(playerId).stream()
                .map(row -> new PlayerPositionView((UUID) row[0], (String) row[1], (UUID) row[2], (String) row[3],
                        TeamSide.fromValue((String) row[4])))
                .toList();
    }

    public PositionResponse create(PositionInput input) {
        if (!players.existsById(input.playerId())) throw new NotFoundException("Jogador", input.playerId());
        if (!regions.existsById(input.regionId())) throw new NotFoundException("Região", input.regionId());
        if (repository.existsByPlayerIdAndRegionIdAndSide(input.playerId(), input.regionId(), input.side())) {
            throw new ConflictException("Esse jogador já tem essa posição nesse lado");
        }
        return PositionResponse.from(
                repository.saveAndFlush(new PlayerPosition(input.playerId(), input.regionId(), input.side())));
    }

    public void delete(UUID id) {
        if (!repository.existsById(id)) throw new NotFoundException("Posição", id);
        repository.deleteById(id);
    }
}

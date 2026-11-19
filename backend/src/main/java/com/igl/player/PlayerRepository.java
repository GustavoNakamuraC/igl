package com.igl.player;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface PlayerRepository extends JpaRepository<Player, UUID> {
    List<Player> findAllByOrderByCreatedAtAsc();

    /** Linhas [map_slug, total] com quantas granadas o jogador sabe em cada mapa. */
    @Query(value = """
            select g.map_slug, count(*)
            from player_grenades pg
            join grenades g on g.id = pg.grenade_id
            where pg.player_id = :playerId
            group by g.map_slug
            """, nativeQuery = true)
    List<Object[]> countGrenadesByMap(UUID playerId);
}

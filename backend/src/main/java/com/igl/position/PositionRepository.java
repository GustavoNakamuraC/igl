package com.igl.position;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface PositionRepository extends JpaRepository<PlayerPosition, UUID> {

    boolean existsByPlayerIdAndRegionIdAndSide(UUID playerId, UUID regionId, TeamSide side);

    @Query("""
            select p from PlayerPosition p, com.igl.region.Region r
            where r.id = p.regionId and r.mapSlug = :mapSlug
            order by p.createdAt
            """)
    List<PlayerPosition> findByMapSlug(String mapSlug);

    /** Linhas [id, map_slug, region_id, region_name, side]. */
    @Query(value = """
            select p.id, r.map_slug, r.id, r.name, p.side
            from player_positions p
            join regions r on r.id = p.region_id
            where p.player_id = :playerId
            order by r.map_slug, p.side, r.name
            """, nativeQuery = true)
    List<Object[]> findViewsByPlayer(UUID playerId);

    List<PlayerPosition> findAllByOrderByCreatedAtAsc();
}

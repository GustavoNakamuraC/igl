package com.igl.grenade;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GrenadeRepository extends JpaRepository<Grenade, UUID> {

    @EntityGraph(attributePaths = {"players", "imageIds"})
    List<Grenade> findByMapSlugOrderByCreatedAtAsc(String mapSlug);

    @EntityGraph(attributePaths = {"players", "imageIds"})
    List<Grenade> findAllByOrderByCreatedAtAsc();
}

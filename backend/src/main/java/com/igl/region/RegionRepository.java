package com.igl.region;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RegionRepository extends JpaRepository<Region, UUID> {
    List<Region> findByMapSlugOrderByCreatedAtAsc(String mapSlug);
}

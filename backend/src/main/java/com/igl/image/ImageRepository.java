package com.igl.image;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface ImageRepository extends JpaRepository<Image, UUID> {

    /** Apaga imagens que não são foto de jogador nem print de granada. */
    @Modifying
    @Query(value = """
            delete from images i
            where not exists (select 1 from players p where p.photo_id = i.id)
              and not exists (select 1 from grenade_images g where g.image_id = i.id)
              and i.created_at < now() - interval '1 hour'
            """, nativeQuery = true)
    int deleteOrphansOlderThanOneHour();

    @Modifying
    @Query(value = """
            delete from images i
            where i.id in (:ids)
              and not exists (select 1 from players p where p.photo_id = i.id)
              and not exists (select 1 from grenade_images g where g.image_id = i.id)
            """, nativeQuery = true)
    int deleteIfOrphan(java.util.Collection<UUID> ids);
}

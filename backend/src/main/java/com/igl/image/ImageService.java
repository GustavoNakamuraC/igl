package com.igl.image;

import com.igl.common.NotFoundException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class ImageService {

    public static final Set<String> ALLOWED_TYPES = Set.of("image/webp", "image/jpeg", "image/png");
    public static final int MAX_BYTES = 2 * 1024 * 1024;

    private final ImageRepository repository;

    public ImageService(ImageRepository repository) {
        this.repository = repository;
    }

    public UUID store(String contentType, byte[] data) {
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new InvalidImageException("Tipo de imagem não suportado: " + contentType + " (use WebP, JPEG ou PNG)");
        }
        if (data.length == 0) {
            throw new InvalidImageException("Arquivo vazio");
        }
        if (data.length > MAX_BYTES) {
            throw new InvalidImageException("Imagem maior que 2 MB");
        }
        return repository.save(new Image(contentType, data)).getId();
    }

    @Transactional(readOnly = true)
    public Image get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Imagem", id));
    }

    @Transactional(readOnly = true)
    public void requireAllExist(Collection<UUID> ids) {
        for (UUID id : ids) {
            if (!repository.existsById(id)) throw new NotFoundException("Imagem", id);
        }
    }

    /** Remove as imagens indicadas se não forem mais usadas por ninguém. */
    public void deleteIfOrphan(Collection<UUID> ids) {
        if (!ids.isEmpty()) repository.deleteIfOrphan(ids);
    }

    /** Limpa uploads abandonados (ex.: formulário cancelado depois de anexar um print). */
    @Scheduled(initialDelay = 60_000, fixedDelay = 3_600_000)
    public void cleanupAbandonedUploads() {
        repository.deleteOrphansOlderThanOneHour();
    }
}

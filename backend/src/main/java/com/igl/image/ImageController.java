package com.igl.image;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService service;

    public ImageController(ImageService service) {
        this.service = service;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, UUID> upload(@RequestParam("file") MultipartFile file) throws IOException {
        return Map.of("id", service.store(file.getContentType(), file.getBytes()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> download(@PathVariable UUID id) {
        Image image = service.get(id);
        // Imagens nunca mudam (trocar = nova imagem), então podem ficar em cache para sempre.
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                .body(image.getData());
    }
}

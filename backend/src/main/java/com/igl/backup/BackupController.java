package com.igl.backup;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private final BackupService service;

    public BackupController(BackupService service) {
        this.service = service;
    }

    @GetMapping
    public BackupData export() {
        return service.export();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void importAll(@Valid @RequestBody BackupData data) {
        service.importAll(data);
    }
}

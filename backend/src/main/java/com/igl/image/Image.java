package com.igl.image;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "images")
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Basic(fetch = FetchType.LAZY)
    @Column(nullable = false)
    private byte[] data;

    @Column(name = "size_bytes", nullable = false)
    private int sizeBytes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Image() {
    }

    public Image(String contentType, byte[] data) {
        this.contentType = contentType;
        this.data = data;
        this.sizeBytes = data.length;
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getContentType() { return contentType; }
    public byte[] getData() { return data; }
    public int getSizeBytes() { return sizeBytes; }
    public Instant getCreatedAt() { return createdAt; }
}

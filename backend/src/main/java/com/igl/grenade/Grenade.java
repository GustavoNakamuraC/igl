package com.igl.grenade;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "grenades")
public class Grenade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "map_slug", nullable = false)
    private String mapSlug;

    @Column(nullable = false)
    private GrenadeType type;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "x", column = @Column(name = "start_x", nullable = false)),
            @AttributeOverride(name = "y", column = @Column(name = "start_y", nullable = false)),
            @AttributeOverride(name = "label", column = @Column(name = "start_label"))
    })
    private ThrowPoint start;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "x", column = @Column(name = "end_x", nullable = false)),
            @AttributeOverride(name = "y", column = @Column(name = "end_y", nullable = false)),
            @AttributeOverride(name = "label", column = @Column(name = "end_label"))
    })
    private ThrowPoint end;

    @Column(name = "how_to", nullable = false)
    private String howTo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getMapSlug() { return mapSlug; }
    public void setMapSlug(String mapSlug) { this.mapSlug = mapSlug; }
    public GrenadeType getType() { return type; }
    public void setType(GrenadeType type) { this.type = type; }
    public ThrowPoint getStart() { return start; }
    public void setStart(ThrowPoint start) { this.start = start; }
    public ThrowPoint getEnd() { return end; }
    public void setEnd(ThrowPoint end) { this.end = end; }
    public String getHowTo() { return howTo; }
    public void setHowTo(String howTo) { this.howTo = howTo; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

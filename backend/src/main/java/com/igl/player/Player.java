package com.igl.player;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "players")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    /** Função principal. */
    private String role;

    /** Função secundária. */
    @Column(name = "secondary_role")
    private String secondaryRole;

    private String notes;

    @Column(nullable = false)
    private PlayerColor color;

    @Column(name = "photo_id")
    private UUID photoId;

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
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getSecondaryRole() { return secondaryRole; }
    public void setSecondaryRole(String secondaryRole) { this.secondaryRole = secondaryRole; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public PlayerColor getColor() { return color; }
    public void setColor(PlayerColor color) { this.color = color; }
    public UUID getPhotoId() { return photoId; }
    public void setPhotoId(UUID photoId) { this.photoId = photoId; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}

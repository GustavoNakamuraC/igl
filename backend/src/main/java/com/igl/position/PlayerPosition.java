package com.igl.position;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "player_positions")
public class PlayerPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "player_id", nullable = false)
    private UUID playerId;

    @Column(name = "region_id", nullable = false)
    private UUID regionId;

    @Column(nullable = false)
    private TeamSide side;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected PlayerPosition() {
    }

    public PlayerPosition(UUID playerId, UUID regionId, TeamSide side) {
        this.playerId = playerId;
        this.regionId = regionId;
        this.side = side;
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getPlayerId() { return playerId; }
    public UUID getRegionId() { return regionId; }
    public TeamSide getSide() { return side; }
    public Instant getCreatedAt() { return createdAt; }
}

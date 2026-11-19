package com.igl.grenade;

import com.igl.player.Player;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
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

    /** Informações adicionais (opcional). */
    private String notes;

    /** Jogadores que sabem fazer esta granada. */
    @ManyToMany
    @JoinTable(name = "player_grenades",
            joinColumns = @JoinColumn(name = "grenade_id"),
            inverseJoinColumns = @JoinColumn(name = "player_id"))
    private Set<Player> players = new LinkedHashSet<>();

    /** Prints anexados (ids de images), na ordem escolhida. */
    @ElementCollection
    @CollectionTable(name = "grenade_images", joinColumns = @JoinColumn(name = "grenade_id"))
    @Column(name = "image_id", nullable = false)
    @OrderColumn(name = "position")
    private List<UUID> imageIds = new ArrayList<>();

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
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Set<Player> getPlayers() { return players; }
    public void setPlayers(Set<Player> players) { this.players.clear(); this.players.addAll(players); }
    public List<UUID> getImageIds() { return imageIds; }
    public void setImageIds(List<UUID> imageIds) { this.imageIds.clear(); this.imageIds.addAll(imageIds); }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

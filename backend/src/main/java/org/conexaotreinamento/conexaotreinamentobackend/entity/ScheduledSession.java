package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "scheduled_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduledSession {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "session_series_id", nullable = true)
    private UUID sessionSeriesId;
    
    @Column(name = "session_id", nullable = false, unique = true)
    private String sessionId; // Human-readable ID like "yoga-2025-09-19-09:00"
    
    @Column(name = "trainer_id")
    private UUID trainerId; // Can be null for cancelled sessions
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", insertable = false, updatable = false)
    private Trainer trainer;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;
    
    @Column(name = "max_participants", nullable = false)
    private int maxParticipants = 1;

    @Column(name = "canceled", nullable = false)
    private boolean canceled = false; // explicit cancellation separate from soft delete
    
    @Column(name = "series_name", nullable = false)
    private String seriesName;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "instance_override", nullable = false)
    private boolean instanceOverride = false; // True when session has instance-specific data
    
    @Column(name = "effective_from_timestamp", nullable = false)
    private Instant effectiveFromTimestamp;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    
    @Column(name = "deleted_at")
    private Instant deletedAt;
    
    @Column(name = "active", nullable = false)
    private boolean active = true;
    
    @OneToMany(mappedBy = "scheduledSession", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SessionParticipant> participants;
    
    // Soft delete methods
    public void softDelete() {
        this.active = false;
        this.deletedAt = Instant.now();
        this.updatedAt = Instant.now();
    }
    
    public void restore() {
        this.active = true;
        this.deletedAt = null;
        this.updatedAt = Instant.now();
    }

    public void updateTimestamp() {
        this.updatedAt = Instant.now();
    }
}

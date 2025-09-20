package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "participant_exercises")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantExercise {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_participant_id", nullable = false)
    private SessionParticipant sessionParticipant;
    
    @Column(name = "exercise_id", nullable = false)
    private UUID exerciseId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", insertable = false, updatable = false)
    private Exercise exercise;
    
    @Column(name = "sets_assigned")
    private Integer setsAssigned;
    
    @Column(name = "sets_completed")
    private Integer setsCompleted;
    
    @Column(name = "reps_assigned")
    private Integer repsAssigned;
    
    @Column(name = "reps_completed")
    private Integer repsCompleted;
    
    @Column(name = "weight_assigned")
    private Double weightAssigned;
    
    @Column(name = "weight_completed")
    private Double weightCompleted;
    
    @Column(name = "exercise_notes", columnDefinition = "TEXT")
    private String exerciseNotes;
    
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
    
    public boolean isActive() {
        return active;
    }
    
    public void updateTimestamp() {
        this.updatedAt = Instant.now();
    }
}

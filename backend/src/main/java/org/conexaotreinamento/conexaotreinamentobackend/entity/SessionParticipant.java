package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "session_participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scheduled_session_id", nullable = false)
    private ScheduledSession scheduledSession;
    
    @Column(name = "student_id", nullable = false)
    private UUID studentId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private Student student;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "participation_type", nullable = false)
    private ParticipationType participationType;
    
    @Column(name = "is_present", nullable = false)
    private boolean isPresent = false;
    
    @Column(name = "attendance_notes", columnDefinition = "TEXT")
    private String attendanceNotes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    
    @Column(name = "deleted_at")
    private Instant deletedAt;
    
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;
    
    @OneToMany(mappedBy = "sessionParticipant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ParticipantExercise> exercises;
    
    // Soft delete methods
    public void softDelete() {
        this.isDeleted = true;
        this.deletedAt = Instant.now();
        this.updatedAt = Instant.now();
    }
    
    public void restore() {
        this.isDeleted = false;
        this.deletedAt = null;
        this.updatedAt = Instant.now();
    }
    
    public boolean isActive() {
        return !isDeleted;
    }
    
    public void updateTimestamp() {
        this.updatedAt = Instant.now();
    }
    
    // Participant management methods for diff pattern
    public boolean isIncluded() {
        return participationType == ParticipationType.INCLUDED;
    }
    
    public boolean isExcluded() {
        return participationType == ParticipationType.EXCLUDED;
    }
    
    // Support for lazy session materialization
    public boolean hasExerciseData() {
        return exercises != null && !exercises.isEmpty();
    }
    
    public enum ParticipationType {
        INCLUDED,    // included_participants: [(participant_id, isPresent, exercises[])]
        EXCLUDED     // excluded_participants: [participant_id] (explicitly removed)
    }
}

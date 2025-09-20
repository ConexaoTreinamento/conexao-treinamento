package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_commitments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentCommitment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "student_id", nullable = false)
    private UUID studentId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private Student student;
    
    @Column(name = "session_series_id", nullable = false)
    private UUID sessionSeriesId; // Links to TrainerSchedule.id
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_series_id", insertable = false, updatable = false)
    private TrainerSchedule trainerSchedule;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "commitment_status", nullable = false)
    private CommitmentStatus commitmentStatus;
    
    @Column(name = "effective_from_timestamp", nullable = false)
    private Instant effectiveFromTimestamp;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    // Temporal commitment methods for event sourcing
    public boolean isActiveAtTimestamp(Instant timestamp) {
        return !effectiveFromTimestamp.isAfter(timestamp);
    }
    
    // Helper method to check if this is the current active commitment
    public boolean isCurrentlyActive() {
        return isActiveAtTimestamp(Instant.now());
    }
    
    // Support commitment patterns
    public boolean isAttending() {
        return commitmentStatus == CommitmentStatus.ATTENDING;
    }
    
    public boolean isNotAttending() {
        return commitmentStatus == CommitmentStatus.NOT_ATTENDING;
    }
    
    public boolean isTentative() {
        return commitmentStatus == CommitmentStatus.TENTATIVE;
    }
}

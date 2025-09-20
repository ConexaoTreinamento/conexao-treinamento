package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_plan_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentPlanHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "student_id", nullable = false)
    private UUID studentId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private Student student;
    
    @Column(name = "plan_id", nullable = false)
    private UUID planId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", insertable = false, updatable = false)
    private StudentPlan plan;
    
    @Column(name = "effective_from_timestamp", nullable = false)
    private Instant effectiveFromTimestamp;
    
    @Column(name = "assigned_by_user_id", nullable = false)
    private UUID assignedByUserId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_user_id", insertable = false, updatable = false)
    private User assignedByUser;
    
    @Column(name = "assignment_notes", columnDefinition = "TEXT")
    private String assignmentNotes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    // Temporal assignment methods for event sourcing
    public boolean isActiveAtTimestamp(Instant timestamp) {
        return !effectiveFromTimestamp.isAfter(timestamp);
    }
    
    // Helper method to check if this is the current active assignment
    public boolean isCurrentlyActive() {
        return isActiveAtTimestamp(Instant.now());
    }
}

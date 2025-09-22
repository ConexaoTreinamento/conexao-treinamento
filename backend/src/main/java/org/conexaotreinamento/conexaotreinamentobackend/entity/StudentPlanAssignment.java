package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

@Entity
@Table(name = "student_plan_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentPlanAssignment {
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
    
    @Column(name = "effective_to_timestamp", nullable = false)
    private Instant effectiveToTimestamp;
    
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
    
    // Helper to convert LocalDate to Instant (start of day, system timezone)
    private Instant toStartOfDayInstant(LocalDate date) {
        return date.atStartOfDay(ZoneId.systemDefault()).toInstant();
    }
    
    // Computed active status based on current time
    public boolean isActive() {
        Instant now = Instant.now();
        return !now.isBefore(effectiveFromTimestamp) && !now.isAfter(effectiveToTimestamp);
    }
    
    // Check if active on specific date (start of day)
    public boolean isActiveOn(LocalDate date) {
        Instant dateInstant = toStartOfDayInstant(date);
        return !dateInstant.isBefore(effectiveFromTimestamp) && !dateInstant.isAfter(effectiveToTimestamp);
    }
    
    // Check if expired
    public boolean isExpired() {
        return Instant.now().isAfter(effectiveToTimestamp);
    }
    
    // Check if starting soon (within days)
    public boolean isStartingSoon(int days) {
        LocalDate futureDate = LocalDate.now().plusDays(days);
        Instant now = Instant.now();
        Instant futureInstant = toStartOfDayInstant(futureDate);
        Instant startInstant = effectiveFromTimestamp;
        return startInstant.isAfter(now) && !startInstant.isAfter(futureInstant);
    }
    
    // Check if expiring soon (within days)
    public boolean isExpiringSoon(int days) {
        LocalDate futureDate = LocalDate.now().plusDays(days);
        Instant now = Instant.now();
        Instant futureInstant = toStartOfDayInstant(futureDate);
        Instant endInstant = effectiveToTimestamp;
        return endInstant.isAfter(now) && !endInstant.isAfter(futureInstant);
    }
}

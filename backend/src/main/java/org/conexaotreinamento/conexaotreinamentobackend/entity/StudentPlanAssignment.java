package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;
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
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;
    
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
    
    // Computed active status based on current date
    public boolean isActive() {
        LocalDate now = LocalDate.now();
        return isActiveOn(now);
    }

    // Check if active on specific date
    public boolean isActiveOn(LocalDate date) {
        if (durationDays == null || durationDays <= 0) {
            return false;
        }
        LocalDate endExclusive = getEndDateExclusive();
        return !date.isBefore(startDate) && date.isBefore(endExclusive);
    }

    // Check if expired
    public boolean isExpired() {
        if (durationDays == null || durationDays <= 0) {
            return true;
        }
        return LocalDate.now().isAfter(getEndDateExclusive().minusDays(1));
    }

    // Check if starting soon (within days)
    public boolean isStartingSoon(int days) {
        LocalDate futureDate = LocalDate.now().plusDays(days);
        return startDate.isAfter(LocalDate.now()) && startDate.isBefore(futureDate.plusDays(1));
    }

    // Check if expiring soon (within days)
    public boolean isExpiringSoon(int days) {
        if (durationDays == null || durationDays <= 0) {
            return false;
        }
        LocalDate endInclusive = getEndDateInclusive();
        LocalDate now = LocalDate.now();
        LocalDate futureDate = now.plusDays(days);
        return endInclusive.isAfter(now) && !endInclusive.isAfter(futureDate);
    }

    @Transient
    public LocalDate getEndDateInclusive() {
        if (durationDays == null || durationDays <= 0) {
            return startDate.minusDays(1);
        }
        return startDate.plusDays(durationDays - 1);
    }

    @Transient
    public LocalDate getEndDateExclusive() {
        int days = durationDays != null ? Math.max(0, durationDays) : 0;
        return startDate.plusDays(days);
    }
}

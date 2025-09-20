package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "name", nullable = false, unique = true)
    private String name;
    
    @Column(name = "max_days", nullable = false)
    private int maxDays;
    
    @Column(name = "cost_brl", nullable = false, precision = 10, scale = 2)
    private BigDecimal costBrl;
    
    @Column(name = "duration_days", nullable = false)
    private int durationDays;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "soft_deleted", nullable = false)
    private boolean softDeleted = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    // Immutable plan template - no edit functionality after creation
    // Plans are soft-deleted for historical integrity
    public void softDelete() {
        this.softDeleted = true;
    }
    
    public boolean isActive() {
        return !softDeleted;
    }
}

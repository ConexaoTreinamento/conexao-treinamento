package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "trainer_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainerSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "trainer_id", nullable = false)
    private UUID trainerId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", insertable = false, updatable = false)
    private Trainer trainer;
    
    @Column(name = "weekday", nullable = false)
    private int weekday; // 0=Sunday, 6=Saturday (matches database)
    
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
    
    @Column(name = "interval_duration", nullable = false)
    private int intervalDuration = 60; // minutes
    
    @Column(name = "series_name", nullable = false)
    private String seriesName;
    
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
    
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;
    
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
    
    // Helper methods for DayOfWeek conversion
    public DayOfWeek getDayOfWeek() {
        // Convert from 0=Sunday to DayOfWeek enum (1=Monday, 7=Sunday)
        return DayOfWeek.of(weekday == 0 ? 7 : weekday);
    }
    
    public void setDayOfWeek(DayOfWeek dayOfWeek) {
        // Convert from DayOfWeek enum to 0=Sunday format
        this.weekday = dayOfWeek == DayOfWeek.SUNDAY ? 0 : dayOfWeek.getValue();
    }
}

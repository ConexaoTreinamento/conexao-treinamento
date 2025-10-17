package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
@EqualsAndHashCode(exclude = "trainer")
@ToString(exclude = "trainer")
public class TrainerSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "trainer_id", nullable = false)
    private UUID trainerId;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", insertable = false, updatable = false)
    private Trainer trainer;
    
    @Column(name = "weekday", nullable = false)
    private int weekday; // 0=Sunday, 6=Saturday (matches database)
    
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    
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

    @Transient
    public LocalTime calculateEndTime() {
        if (startTime == null) return null;
        int duration = Math.max(0, intervalDuration);
        return startTime.plusMinutes(duration);
    }
}

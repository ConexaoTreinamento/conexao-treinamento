package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.conexaotreinamento.conexaotreinamentobackend.enums.EventStatus;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "events")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "event_id")
    private UUID id;

    @Column(nullable = false, length = 200)
    @Setter
    private String name;

    @Column(name = "event_date", nullable = false)
    @Setter
    private LocalDate date;

    @Column(name = "start_time")
    @Setter
    private LocalTime startTime;

    @Column(name = "end_time")
    @Setter
    private LocalTime endTime;

    @Column(length = 255)
    @Setter
    private String location;

    @Column(columnDefinition = "TEXT")
    @Setter
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", nullable = false)
    @Setter
    private Trainer trainer;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Setter
    private EventStatus status = EventStatus.OPEN;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EventParticipant> participants;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    @Setter
    private Instant deletedAt;

    public Event(String name, LocalDate date) {
        this.name = name;
        this.date = date;
    }

    public boolean isActive() {
        return deletedAt == null;
    }

    public boolean isInactive() {
        return deletedAt != null;
    }

    public void activate() {
        deletedAt = null;
    }

    public void deactivate() {
        deletedAt = Instant.now();
    }
}

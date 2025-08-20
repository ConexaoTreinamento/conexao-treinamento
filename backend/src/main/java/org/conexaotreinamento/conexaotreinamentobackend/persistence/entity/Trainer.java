package org.conexaotreinamento.conexaotreinamentobackend.persistence.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.conexaotreinamento.conexaotreinamentobackend.persistence.entity.enums.CompensationType;
import org.hibernate.annotations.Type;
import org.hibernate.dialect.PostgreSQLArrayJdbcType;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "trainers")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor
public class Trainer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120)
    @Setter
    private String name;

    @Column(length = 255)
    @Setter
    private String email;

    @Column(length = 255)
    @Setter
    private String phone;

    @Column(name = "specialties")
    @Setter
    private List<String> specialties;

    @Column(name = "compensation_type")
    @Setter
    private CompensationType compensationType;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    @Setter
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    @Setter
    private Instant updatedAt;

    @Column(name = "deleted_at")
    @Setter
    private Instant deletedAt;

    public boolean isActive() {
        return deletedAt == null;
    }

    public boolean isInactive() {
        return deletedAt != null;
    }

    public void activate() {
        this.deletedAt = null;
    }

    public void deactivate() {
        this.deletedAt = Instant.now();
    }
}

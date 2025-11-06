package org.conexaotreinamento.conexaotreinamentobackend.entity;

import java.time.Instant;
import java.util.UUID;

import lombok.*;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120, unique = true)
    @Setter
    private String email;

    @Column(nullable = false, length = 120)
    @Setter
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    @Setter
    private Role role;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "password_expired_at")
    private Instant passwordExpiredAt;

    public boolean isPasswordExpired() {
        return passwordExpiredAt != null && !passwordExpiredAt.isAfter(Instant.now());
    }

    public void setPasswordExpired(boolean expired) {
        if (expired) {
            this.passwordExpiredAt = Instant.now();
        } else {
            this.passwordExpiredAt = null;
        }
    }

    public User(String email, String password, Role role) {
        this.email = email;
        this.password = password;
        this.role = role;
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

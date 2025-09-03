package org.conexaotreinamento.conexaotreinamentobackend.entity;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "administrators")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Administrator {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "first_name", nullable = false, length = 100)
    @Setter
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    @Setter
    private String lastName;

    @Column(nullable = false, length = 255, unique = true)
    @Setter
    private String email;

    @Column(nullable = false, length = 255)
    @Setter
    private String password;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    @Setter
    private Instant deletedAt;

    public Administrator(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

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

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
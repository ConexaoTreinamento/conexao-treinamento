package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "students")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "student_id")
    private UUID id;

    @Column(nullable = false, length = 255)
    @Setter
    private String email;

    @Column(nullable = false, length = 100)
    @Setter
    private String name;

    @Column(nullable = false, length = 100)
    @Setter
    private String surname;

    @Column(nullable = false, length = 1)
    @Enumerated(EnumType.STRING)
    @Setter
    private Gender gender;

    @Column(name = "birth_date", nullable = false)
    @Setter
    private LocalDate birthDate;

    @Column(length = 20)
    @Setter
    private String phone;

    @Column(length = 100)
    @Setter
    private String profession;

    @Column(length = 255)
    @Setter
    private String street;

    @Column(length = 10)
    @Setter
    private String number;

    @Column(length = 100)
    @Setter
    private String complement;

    @Column(length = 100)
    @Setter
    private String neighborhood;

    @Column(length = 10)
    @Setter
    private String cep;

    @Column(name = "emergency_contact_name", length = 100)
    @Setter
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 20)
    @Setter
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relationship", length = 50)
    @Setter
    private String emergencyContactRelationship;

    @Column(columnDefinition = "TEXT")
    @Setter
    private String objectives;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    @Setter
    private Instant deletedAt;

    public Student(String email, String name, String surname, Gender gender, LocalDate birthDate) {
        this.email = email;
        this.name = name;
        this.surname = surname;
        this.gender = gender;
        this.birthDate = birthDate;
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

    public enum Gender {
        M, F, O
    }
}

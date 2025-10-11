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
@Table(name = "physical_evaluations")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PhysicalEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "evaluation_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @Setter
    private Student student;

    @Column(name = "evaluation_date", nullable = false)
    @Setter
    private LocalDate date;

    @Column(nullable = false)
    @Setter
    private Double weight;

    @Column(nullable = false)
    @Setter
    private Double height;

    @Column(nullable = false)
    @Setter
    private Double bmi;

    @Embedded
    @Setter
    private Circumferences circumferences;

    @Embedded
    @Setter
    private SubcutaneousFolds subcutaneousFolds;

    @Embedded
    @Setter
    private Diameters diameters;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    @Setter
    private Instant deletedAt;

    public PhysicalEvaluation(Student student, LocalDate date, Double weight, Double height, Double bmi) {
        this.student = student;
        this.date = date;
        this.weight = weight;
        this.height = height;
        this.bmi = bmi;
    }

    public boolean isActive() {
        return deletedAt == null;
    }

    public boolean isInactive() {
        return deletedAt != null;
    }

    public void deactivate() {
        deletedAt = Instant.now();
    }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    public static class Circumferences {
        @Column(name = "circ_right_arm_relaxed")
        private Double rightArmRelaxed;

        @Column(name = "circ_left_arm_relaxed")
        private Double leftArmRelaxed;

        @Column(name = "circ_right_arm_flexed")
        private Double rightArmFlexed;

        @Column(name = "circ_left_arm_flexed")
        private Double leftArmFlexed;

        @Column(name = "circ_waist")
        private Double waist;

        @Column(name = "circ_abdomen")
        private Double abdomen;

        @Column(name = "circ_hip")
        private Double hip;

        @Column(name = "circ_right_thigh")
        private Double rightThigh;

        @Column(name = "circ_left_thigh")
        private Double leftThigh;

        @Column(name = "circ_right_calf")
        private Double rightCalf;

        @Column(name = "circ_left_calf")
        private Double leftCalf;
    }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    public static class SubcutaneousFolds {
        @Column(name = "fold_triceps")
        private Double triceps;

        @Column(name = "fold_thorax")
        private Double thorax;

        @Column(name = "fold_subaxillary")
        private Double subaxillary;

        @Column(name = "fold_subscapular")
        private Double subscapular;

        @Column(name = "fold_abdominal")
        private Double abdominal;

        @Column(name = "fold_suprailiac")
        private Double suprailiac;

        @Column(name = "fold_thigh")
        private Double thigh;
    }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    public static class Diameters {
        @Column(name = "diam_umerus")
        private Double umerus;

        @Column(name = "diam_femur")
        private Double femur;
    }
}


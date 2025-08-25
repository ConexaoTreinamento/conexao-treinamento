package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "physical_impairments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PhysicalImpairment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @Setter
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Setter
    private PhysicalImpairmentType impairmentType;

    @Column(nullable = false, length = 255)
    @Setter
    private String name;

    @Column(columnDefinition = "TEXT")
    @Setter
    private String observations;

    public PhysicalImpairment(Student student, PhysicalImpairmentType impairmentType, String name, String observations) {
        this.student = student;
        this.impairmentType = impairmentType;
        this.name = name;
        this.observations = observations;
    }

    public enum PhysicalImpairmentType {
        VISUAL, AUDITORY, MOTOR, INTELLECTUAL, MULTIPLE
    }
}

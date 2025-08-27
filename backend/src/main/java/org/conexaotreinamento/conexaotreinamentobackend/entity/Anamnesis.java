package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "anamnesis")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Anamnesis {

    @Id
    @Column(name = "student_id")
    private UUID studentId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "student_id")
    @Setter
    private Student student;

    @Column()
    @Setter
    private String medication;

    @Column(name = "is_doctor_aware_of_physical_activity")
    @Setter
    private Boolean isDoctorAwareOfPhysicalActivity;

    @Column(name = "favorite_physical_activity", length = 255)
    @Setter
    private String favoritePhysicalActivity;

    @Enumerated(EnumType.STRING)
    @Column(name = "has_insomnia")
    @Setter
    private InsomniaFrequency hasInsomnia;

    @Column(name = "diet_oriented_by", length = 255)
    @Setter
    private String dietOrientedBy;

    @Column(name = "cardiac_problems")
    @Setter
    private String cardiacProblems;

    @Column(name = "has_hypertension")
    @Setter
    private Boolean hasHypertension;

    @Column(name = "chronic_diseases")
    @Setter
    private String chronicDiseases;

    @Column(name = "difficulties_in_physical_activities")
    @Setter
    private String difficultiesInPhysicalActivities;

    @Column(name = "medical_orientations_to_avoid_physical_activity")
    @Setter
    private String medicalOrientationsToAvoidPhysicalActivity;

    @Column(name = "surgeries_in_the_last_12_months")
    @Setter
    private String surgeriesInTheLast12Months;

    @Column(name = "respiratory_problems")
    @Setter
    private String respiratoryProblems;

    @Column(name = "joint_muscular_back_pain")
    @Setter
    private String jointMuscularBackPain;

    @Column(name = "spinal_disc_problems")
    @Setter
    private String spinalDiscProblems;

    @Column(length = 255)
    @Setter
    private String diabetes;

    @Column(name = "smoking_duration", length = 100)
    @Setter
    private String smokingDuration;

    @Column(name = "altered_cholesterol")
    @Setter
    private Boolean alteredCholesterol;

    @Column(name = "osteoporosis_location", length = 255)
    @Setter
    private String osteoporosisLocation;

    public Anamnesis(Student student) {
        this.student = student;
        studentId = student.getId();
    }

    public enum InsomniaFrequency {
        NEVER, RARELY, SOMETIMES, OFTEN, ALWAYS
    }
}

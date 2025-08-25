package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis;

public record AnamnesisResponseDTO(
        String medication,
        Boolean isDoctorAwareOfPhysicalActivity,
        String favoritePhysicalActivity,
        Anamnesis.InsomniaFrequency hasInsomnia,
        String dietOrientedBy,
        String cardiacProblems,
        Boolean hasHypertension,
        String chronicDiseases,
        String difficultiesInPhysicalActivities,
        String medicalOrientationsToAvoidPhysicalActivity,
        String surgeriesInTheLast12Months,
        String respiratoryProblems,
        String jointMuscularBackPain,
        String spinalDiscProblems,
        String diabetes,
        String smokingDuration,
        Boolean alteredCholesterol,
        String osteoporosisLocation
) {
    public static AnamnesisResponseDTO fromEntity(Anamnesis anamnesis) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}

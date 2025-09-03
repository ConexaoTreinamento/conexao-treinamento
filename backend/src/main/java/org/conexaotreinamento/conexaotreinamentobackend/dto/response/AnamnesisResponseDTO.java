package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis;

public record AnamnesisResponseDTO(
        String medication,
        boolean isDoctorAwareOfPhysicalActivity,
        String favoritePhysicalActivity,
        Anamnesis.InsomniaFrequency hasInsomnia,
        String dietOrientedBy,
        String cardiacProblems,
        boolean hasHypertension,
        String chronicDiseases,
        String difficultiesInPhysicalActivities,
        String medicalOrientationsToAvoidPhysicalActivity,
        String surgeriesInTheLast12Months,
        String respiratoryProblems,
        String jointMuscularBackPain,
        String spinalDiscProblems,
        String diabetes,
        String smokingDuration,
        boolean alteredCholesterol,
        String osteoporosisLocation
) {
    public static AnamnesisResponseDTO fromEntity(Anamnesis anamnesis) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}

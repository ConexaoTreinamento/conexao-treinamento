package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

public record AgeDistributionResponseDTO(
        String ageRange,
        Integer count,
        Double percentage
) {}


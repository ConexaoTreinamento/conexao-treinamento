package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

public record AgeDistributionDTO(
        String ageRange,
        Integer count,
        Double percentage
) {}


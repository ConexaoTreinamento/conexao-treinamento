package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment;

import java.util.UUID;

public record PhysicalImpairmentResponseDTO(
        UUID id,
        PhysicalImpairment.PhysicalImpairmentType type,
        String name,
        String observations
) {
    public static PhysicalImpairmentResponseDTO fromEntity(PhysicalImpairment physicalImpairment) {
        if (physicalImpairment == null) return null;

        return new PhysicalImpairmentResponseDTO(
                physicalImpairment.getId(),
                physicalImpairment.getImpairmentType(),
                physicalImpairment.getName(),
                physicalImpairment.getObservations()
        );
    }
}

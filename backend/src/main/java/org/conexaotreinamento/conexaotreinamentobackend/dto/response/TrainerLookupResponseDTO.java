package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;

import java.util.UUID;

public record TrainerLookupResponseDTO(
        UUID id,
        String name
) {
    public static TrainerLookupResponseDTO fromEntity(Trainer trainer) {
        if (trainer == null) return null;
        return new TrainerLookupResponseDTO(
                trainer.getId(),
                "Prof. " + trainer.getName()
        );
    }
}

package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;

import java.util.UUID;

public record TrainerLookupDTO(
        UUID id,
        String name
) {
    public static TrainerLookupDTO fromEntity(Trainer trainer) {
        if (trainer == null) return null;
        return new TrainerLookupDTO(
                trainer.getId(),
                "Prof. " + trainer.getName()
        );
    }
}

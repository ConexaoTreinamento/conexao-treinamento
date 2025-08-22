package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.entity.enums.CompensationType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TrainerResponseDTO(
        UUID id,
        String name,
        String email,
        String phone,
        List<String> specialties,
        CompensationType compensationType,
        Instant createdAt,
        Instant updatedAt,
        boolean active
) {

    public static TrainerResponseDTO fromEntity(Trainer trainer) {
        return new TrainerResponseDTO(
                trainer.getId(),
                trainer.getName(),
                trainer.getEmail(),
                trainer.getPhone(),
                trainer.getSpecialties(),
                trainer.getCompensationType(),
                trainer.getCreatedAt(),
                trainer.getUpdatedAt(),
                trainer.isActive()
        );
    }
}

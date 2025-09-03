package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TrainerResponseDTO(
        UUID id,
        String name,
        String email,
        String phone,
        List<String> specialties,
        CompensationType compensationType
) {

    public static TrainerResponseDTO fromEntity(Trainer trainer, String email) {
        return new TrainerResponseDTO(
                trainer.getId(),
                trainer.getName(),
                email,
                trainer.getPhone(),
                trainer.getSpecialties(),
                trainer.getCompensationType()
        );
    }
}

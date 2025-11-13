package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TrainerResponseDTO(
        UUID id,
        String name,
        String email,
        String phone,
        String address,
        LocalDate birthDate,
        List<String> specialties,
        CompensationType compensationType,
        Instant joinDate
) {

    public static TrainerResponseDTO fromEntity(Trainer trainer, String email, Instant joinDate) {
        return new TrainerResponseDTO(
                trainer.getId(),
                trainer.getName(),
                email,
                trainer.getPhone(),
                trainer.getAddress(),
                trainer.getBirthDate(),
                trainer.getSpecialties(),
                trainer.getCompensationType(),
                joinDate
        );
    }
}

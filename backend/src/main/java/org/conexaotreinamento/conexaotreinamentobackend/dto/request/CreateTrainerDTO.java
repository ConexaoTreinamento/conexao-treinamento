package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.entity.enums.CompensationType;

import java.util.List;
import java.util.UUID;

public record CreateTrainerDTO(
    String name,
    String email,
    String phone,
    String password,
    List<String> specialties,
    CompensationType compensationType
) {

    public Trainer toEntity(UUID userId) {
        Trainer trainer = new Trainer();
        trainer.setUserId(userId);
        trainer.setName(name);
        trainer.setPhone(phone);
        trainer.setSpecialties(specialties);
        trainer.setCompensationType(compensationType);

        return trainer;
    }
}

package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.entity.enums.CompensationType;

import java.util.List;

public record CreateTrainerDTO(
    String name,
    String email,
    String phone,
    String password,
    List<String> specialties,
    CompensationType compensationType
) {

    public Trainer toEntity() {
        Trainer trainer = new Trainer();
        trainer.setName(name);
        trainer.setEmail(email);
        trainer.setPhone(phone);
        trainer.setSpecialties(specialties);
        trainer.setCompensationType(compensationType);

        return trainer;
    }
}

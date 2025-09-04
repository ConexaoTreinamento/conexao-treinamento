package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateTrainerDTO(
    String name,
    String email,
    String phone,
    String password,
    String address,
    LocalDate birthDate,
    List<String> specialties,
    CompensationType compensationType
) {

    public Trainer toEntity(UUID userId) {
        Trainer trainer = new Trainer();
        trainer.setUserId(userId);
        trainer.setName(name);
        trainer.setPhone(phone);
        trainer.setAddress(address);
        trainer.setBirthDate(birthDate);
        trainer.setSpecialties(specialties);
        trainer.setCompensationType(compensationType);

        return trainer;
    }

    public boolean hasPassword() {
        return password != null && !password.trim().isEmpty();
    }
}

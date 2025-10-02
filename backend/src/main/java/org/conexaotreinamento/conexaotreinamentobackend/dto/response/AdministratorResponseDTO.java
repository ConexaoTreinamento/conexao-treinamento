package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import java.time.Instant;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;

public record AdministratorResponseDTO(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String fullName,
        Instant createdAt,
        Instant updatedAt,
        boolean active
) {
    public static AdministratorResponseDTO fromEntity(Administrator administrator) {
        return new AdministratorResponseDTO(
                administrator.getId(),
                administrator.getFirstName(),
                administrator.getLastName(),
                administrator.getEmail(),
                administrator.getFullName(),
                administrator.getCreatedAt(),
                administrator.getUpdatedAt(),
                administrator.isActive()
        );
    }
}
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
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdministratorResponseDTO fromEntity(Administrator administrator, String email, boolean active, Instant createdAt, Instant updatedAt) {
        return new AdministratorResponseDTO(
                administrator.getId(),
                administrator.getFirstName(),
                administrator.getLastName(),
                email,
                administrator.getFullName(),
                active,
                createdAt,
                updatedAt
        );
    }
}
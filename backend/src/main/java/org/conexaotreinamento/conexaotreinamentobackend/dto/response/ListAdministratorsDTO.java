package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import java.time.Instant;
import java.util.UUID;

public record ListAdministratorsDTO(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String fullName,
        boolean active,
        Instant joinDate
) {
}
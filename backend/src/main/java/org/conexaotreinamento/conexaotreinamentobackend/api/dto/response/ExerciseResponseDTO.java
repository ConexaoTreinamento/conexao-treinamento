package org.conexaotreinamento.conexaotreinamentobackend.api.dto.response;

import java.time.Instant;
import java.util.UUID;

public record ExerciseResponseDTO(
        UUID id,
        String name,
        String description,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt
) {}
package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import java.time.Instant;
import java.util.UUID;

public record StudentPlanResponseDTO(
        UUID id,
        String name,
        Integer maxDays,
        Integer durationDays,
        String description,
        Boolean active,
        Instant createdAt
) {}

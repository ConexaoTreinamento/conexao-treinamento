package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import java.time.LocalDateTime;
import java.util.UUID;

public record OneOffSessionCreateRequestDTO(
        String seriesName,
        UUID trainerId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String notes
) {}

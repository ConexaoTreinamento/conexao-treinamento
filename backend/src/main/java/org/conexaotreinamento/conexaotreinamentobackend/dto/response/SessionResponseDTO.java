package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SessionResponseDTO(
        String sessionId,
        UUID trainerId,
        String trainerName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String seriesName,
        String notes,
        boolean instanceOverride,
        List<StudentCommitmentResponseDTO> students,
        boolean canceled,
        Integer presentCount
) {}

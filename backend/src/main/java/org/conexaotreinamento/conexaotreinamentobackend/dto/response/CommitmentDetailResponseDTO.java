package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;

import java.time.Instant;
import java.util.UUID;

public record CommitmentDetailResponseDTO(
        UUID id,
        UUID studentId,
        String studentName,
        UUID sessionSeriesId,
        String seriesName,
        CommitmentStatus commitmentStatus,
        Instant effectiveFromTimestamp,
        Instant createdAt
) {}

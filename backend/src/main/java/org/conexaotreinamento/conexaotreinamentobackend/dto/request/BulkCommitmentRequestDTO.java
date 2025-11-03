package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record BulkCommitmentRequestDTO(
        @NotEmpty(message = "Session series IDs cannot be empty")
        List<UUID> sessionSeriesIds,

        @NotNull(message = "Commitment status is required")
        CommitmentStatus commitmentStatus,

        Instant effectiveFromTimestamp
) {}

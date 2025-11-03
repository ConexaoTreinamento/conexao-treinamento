package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotNull;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;

import java.time.Instant;

public record StudentCommitmentRequestDTO(
        @NotNull(message = "Commitment status is required")
        CommitmentStatus commitmentStatus,

        Instant effectiveFromTimestamp
) {}

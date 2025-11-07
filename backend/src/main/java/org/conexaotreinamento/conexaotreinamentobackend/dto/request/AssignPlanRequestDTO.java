package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record AssignPlanRequestDTO(
        @NotNull(message = "Plan ID is required")
        UUID planId,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        String assignmentNotes
) {}

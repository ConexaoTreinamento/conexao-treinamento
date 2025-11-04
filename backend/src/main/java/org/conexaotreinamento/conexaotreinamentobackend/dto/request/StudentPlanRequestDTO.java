package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record StudentPlanRequestDTO(
        @NotBlank(message = "Plan name is required")
        String name,

        @NotNull(message = "Max days is required")
        @Positive(message = "Max days must be positive")
        Integer maxDays,

        @NotNull(message = "Duration days is required")
        @Positive(message = "Duration days must be positive")
        Integer durationDays,

        String description
) {}

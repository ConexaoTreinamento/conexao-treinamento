package org.conexaotreinamento.conexaotreinamentobackend.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateExerciseRequestDTO(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 255) String description
) {}


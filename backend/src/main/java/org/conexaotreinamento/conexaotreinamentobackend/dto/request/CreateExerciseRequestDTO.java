package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateExerciseRequestDTO(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 255) String description
) {}

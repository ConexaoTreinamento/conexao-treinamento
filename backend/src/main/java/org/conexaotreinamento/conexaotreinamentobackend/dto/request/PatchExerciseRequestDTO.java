package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.Size;

public record PatchExerciseRequestDTO(
        @Size(max = 120) String name,
        @Size(max = 255) String description
) {}

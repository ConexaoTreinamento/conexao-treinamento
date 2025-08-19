package org.conexaotreinamento.conexaotreinamentobackend.api.dto.request;

import jakarta.validation.constraints.Size;

public record PatchExerciseRequestDTO(
        @Size(max = 120) String name,
        @Size(max = 255) String description
) {}

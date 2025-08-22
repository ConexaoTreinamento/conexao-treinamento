package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Exercise;

import java.time.Instant;
import java.util.UUID;

public record ExerciseResponseDTO(
        UUID id,
        String name,
        String description,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt
) {
    public static ExerciseResponseDTO fromEntity(Exercise exercise) {
        return new ExerciseResponseDTO(
                exercise.getId(),
                exercise.getName(),
                exercise.getDescription(),
                exercise.getCreatedAt(),
                exercise.getUpdatedAt(),
                exercise.getDeletedAt()
        );
    }
}

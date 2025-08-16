package org.conexaotreinamento.conexaotreinamentobackend.api.mapper;

import org.conexaotreinamento.conexaotreinamentobackend.api.dto.request.CreateExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.api.dto.response.ExerciseResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.persistence.entity.Exercise;
import org.springframework.stereotype.Component;

@Component
public class ExerciseMapper {
    public Exercise toEntity(CreateExerciseRequestDTO request) {
        return new Exercise(request.name(), request.description());
    }

    public ExerciseResponseDTO toResponse(Exercise exercise) {
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

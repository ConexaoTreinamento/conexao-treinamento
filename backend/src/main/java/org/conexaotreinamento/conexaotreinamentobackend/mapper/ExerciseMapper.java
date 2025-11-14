package org.conexaotreinamento.conexaotreinamentobackend.mapper;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ExerciseResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Exercise;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Exercise entities and DTOs.
 */
@Component
public class ExerciseMapper {
    
    /**
     * Converts Exercise entity to ExerciseResponseDTO.
     */
    public ExerciseResponseDTO toResponse(Exercise entity) {
        return ExerciseResponseDTO.fromEntity(entity);
    }
    
    /**
     * Converts ExerciseRequestDTO to new Exercise entity.
     */
    public Exercise toEntity(ExerciseRequestDTO request) {
        return new Exercise(request.name(), request.description());
    }
    
    /**
     * Updates existing Exercise entity with data from ExerciseRequestDTO.
     */
    public void updateEntity(ExerciseRequestDTO request, Exercise entity) {
        entity.setName(request.name());
        entity.setDescription(request.description());
    }
    
    /**
     * Partially updates existing Exercise entity with non-null fields from PatchExerciseRequestDTO.
     */
    public void patchEntity(PatchExerciseRequestDTO request, Exercise entity) {
        if (request.name() != null) {
            entity.setName(request.name());
        }
        if (request.description() != null) {
            entity.setDescription(request.description());
        }
    }
}


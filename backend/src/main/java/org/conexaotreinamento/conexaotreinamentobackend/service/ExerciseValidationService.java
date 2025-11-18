package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.repository.ExerciseRepository;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.BusinessException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for Exercise-specific validation logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExerciseValidationService {
    
    private final ExerciseRepository exerciseRepository;
    
    /**
     * Validates that exercise name is unique among active exercises.
     * 
     * @param name Exercise name to check
     * @throws BusinessException if name already exists
     */
    public void validateNameUniqueness(String name) {
        validateNameUniqueness(name, null);
    }
    
    /**
     * Validates that exercise name is unique among active exercises, excluding a specific exercise.
     * 
     * @param name Exercise name to check
     * @param excludeId Exercise ID to exclude from check (for updates)
     * @throws BusinessException if name already exists
     */
    public void validateNameUniqueness(String name, UUID excludeId) {
        log.debug("Validating exercise name uniqueness: {} (exclude ID: {})", name, excludeId);
        
        boolean exists;
        if (excludeId == null) {
            exists = exerciseRepository.existsByNameIgnoringCaseAndDeletedAtIsNull(name);
        } else {
            exists = exerciseRepository.existsByNameIgnoringCaseAndDeletedAtIsNullAndIdNot(name, excludeId);
        }
        
        if (exists) {
            log.warn("Name validation failed - Exercise name already exists: {}", name);
            throw new BusinessException(
                    String.format("Exercise with name '%s' already exists", name),
                    "DUPLICATE_NAME"
            );
        }
    }
}


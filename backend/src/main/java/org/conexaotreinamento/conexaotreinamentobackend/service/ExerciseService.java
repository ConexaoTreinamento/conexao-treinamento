package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ExerciseResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Exercise;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.ExerciseMapper;
import org.conexaotreinamento.conexaotreinamentobackend.repository.ExerciseRepository;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.PageResponse;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.BusinessException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing Exercise entities.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ExerciseService {
    
    private final ExerciseRepository exerciseRepository;
    private final ExerciseMapper exerciseMapper;
    private final ExerciseValidationService validationService;

    /**
     * Creates a new exercise.
     * 
     * @param request Exercise creation request
     * @return Created exercise
     * @throws BusinessException if exercise name already exists
     */
    public ExerciseResponseDTO create(ExerciseRequestDTO request) {
        log.info("Creating exercise: {}", request.name());
        
        // Validate name uniqueness
        validationService.validateNameUniqueness(request.name());
        
        Exercise exercise = exerciseMapper.toEntity(request);
        Exercise saved = exerciseRepository.save(exercise);
        
        log.info("Exercise created successfully [ID: {}] - Name: {}", saved.getId(), saved.getName());
        return exerciseMapper.toResponse(saved);
    }

    /**
     * Finds an exercise by ID.
     * 
     * @param id Exercise ID
     * @return Exercise details
     * @throws ResourceNotFoundException if exercise not found
     */
    public ExerciseResponseDTO findById(UUID id) {
        log.debug("Finding exercise by ID: {}", id);
        Exercise exercise = findEntityById(id);
        return exerciseMapper.toResponse(exercise);
    }

    /**
     * Finds all exercises with optional search and filtering.
     * 
     * @param search Search term (optional)
     * @param pageable Pagination parameters
     * @param includeInactive Whether to include soft-deleted exercises
     * @return Paginated list of exercises
     */
    public PageResponse<ExerciseResponseDTO> findAll(String search, Pageable pageable, boolean includeInactive) {
        log.debug("Listing exercises - search: {}, includeInactive: {}, page: {}", search, includeInactive, pageable);

        Page<Exercise> exercises;

        if (search == null || search.isBlank()) {
            // Apply default sorting if none provided
            if (pageable.getSort().isUnsorted()) {
                pageable = PageRequest.of(
                        pageable.getPageNumber(), 
                        pageable.getPageSize(),
                        Sort.by("createdAt").descending()
                );
            }

            exercises = includeInactive 
                    ? exerciseRepository.findAll(pageable) 
                    : exerciseRepository.findByDeletedAtIsNull(pageable);
        } else {
            String searchTerm = "%" + search.toLowerCase() + "%";

            exercises = includeInactive
                    ? exerciseRepository.findBySearchTermIncludingInactive(searchTerm, pageable)
                    : exerciseRepository.findBySearchTermAndDeletedAtIsNull(searchTerm, pageable);
        }
        
        log.debug("Found {} exercises", exercises.getTotalElements());
        
        Page<ExerciseResponseDTO> responsePage = exercises.map(exerciseMapper::toResponse);
        return PageResponse.of(responsePage);
    }

    /**
     * Updates an existing exercise.
     * 
     * @param id Exercise ID
     * @param request Updated exercise data
     * @return Updated exercise
     * @throws ResourceNotFoundException if exercise not found
     * @throws BusinessException if new name already exists
     */
    public ExerciseResponseDTO update(UUID id, ExerciseRequestDTO request) {
        log.info("Updating exercise [ID: {}] - newName: {}", id, request.name());
        
        Exercise exercise = findEntityById(id);

        // Validate name uniqueness if changed
        if (!exercise.getName().equalsIgnoreCase(request.name())) {
            validationService.validateNameUniqueness(request.name(), id);
        }

        exerciseMapper.updateEntity(request, exercise);
        Exercise saved = exerciseRepository.save(exercise);
        
        log.info("Exercise updated successfully [ID: {}] - Name: {}", id, saved.getName());
        return exerciseMapper.toResponse(saved);
    }

    /**
     * Partially updates an exercise with only provided fields.
     * 
     * @param id Exercise ID
     * @param request Partial update request
     * @return Updated exercise
     * @throws ResourceNotFoundException if exercise not found
     * @throws BusinessException if new name already exists
     */
    public ExerciseResponseDTO patch(UUID id, PatchExerciseRequestDTO request) {
        log.info("Patching exercise [ID: {}]", id);
        
        Exercise exercise = findEntityById(id);

        // Validate name uniqueness if name is being changed
        if (request.name() != null && !exercise.getName().equalsIgnoreCase(request.name())) {
            validationService.validateNameUniqueness(request.name(), id);
        }

        exerciseMapper.patchEntity(request, exercise);
        Exercise saved = exerciseRepository.save(exercise);
        
        log.info("Exercise patched successfully [ID: {}]", id);
        return exerciseMapper.toResponse(saved);
    }

    /**
     * Soft deletes an exercise.
     * 
     * @param id Exercise ID
     * @throws ResourceNotFoundException if exercise not found
     */
    public void delete(UUID id) {
        log.info("Deleting exercise [ID: {}]", id);
        
        Exercise exercise = findEntityById(id);
        exercise.deactivate();
        exerciseRepository.save(exercise);
        
        log.info("Exercise deactivated successfully [ID: {}]", id);
    }

    /**
     * Restores a soft-deleted exercise.
     * 
     * @param id Exercise ID
     * @return Restored exercise
     * @throws ResourceNotFoundException if exercise not found
     * @throws BusinessException if exercise is already active or name conflict exists
     */
    public ExerciseResponseDTO restore(UUID id) {
        log.info("Restoring exercise [ID: {}]", id);
        
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise", id));
        
        if (exercise.isActive()) {
            throw new BusinessException("Exercise is already active", "ALREADY_ACTIVE");
        }
        
        if (exerciseRepository.existsByNameIgnoringCaseAndDeletedAtIsNull(exercise.getName())) {
            throw new BusinessException(
                    "Cannot restore exercise: name already exists",
                    "NAME_CONFLICT"
            );
        }

        exercise.activate();
        Exercise saved = exerciseRepository.save(exercise);
        
        log.info("Exercise restored successfully [ID: {}]", id);
        return exerciseMapper.toResponse(saved);
    }
    
    /**
     * Helper method to find an active exercise entity by ID.
     * 
     * @param id Exercise ID
     * @return Exercise entity
     * @throws ResourceNotFoundException if not found or inactive
     */
    private Exercise findEntityById(UUID id) {
        return exerciseRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise", id));
    }
}

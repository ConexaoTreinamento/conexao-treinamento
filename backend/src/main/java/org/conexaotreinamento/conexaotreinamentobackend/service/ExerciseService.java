package org.conexaotreinamento.conexaotreinamentobackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ExerciseResponseDTO;
import org.springframework.web.server.ResponseStatusException;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Exercise;
import org.conexaotreinamento.conexaotreinamentobackend.repository.ExerciseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class ExerciseService {
    private final ExerciseRepository repository;

    @Transactional
    public ExerciseResponseDTO create(ExerciseRequestDTO request) {
        log.debug("Creating exercise - name: {}", request.name());
        if (repository.existsByNameIgnoringCaseAndDeletedAtIsNull(request.name())) {
            log.warn("Exercise creation failed - Name already exists: {}", request.name());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Exercise already exists");
        }

        Exercise exercise = new Exercise(request.name(), request.description());
        Exercise saved = repository.save(exercise);
        log.info("Exercise created successfully [ID: {}] - Name: {}", saved.getId(), saved.getName());
        return ExerciseResponseDTO.fromEntity(saved);
    }

    public ExerciseResponseDTO findById(UUID id) {
        log.debug("Finding exercise by ID: {}", id);
        Exercise exercise = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));
        return ExerciseResponseDTO.fromEntity(exercise);
    }

    public Page<ExerciseResponseDTO> findAll(String search, Pageable pageable, boolean includeInactive) {
        log.debug("Listing exercises - search: {}, includeInactive: {}, page: {}", search, includeInactive, pageable);

        Page<Exercise> exercises;

        if (search == null || search.isBlank()) {

            if (pageable.getSort().isUnsorted()) {
                pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                        Sort.by("createdAt").descending());
            }

            exercises = includeInactive ? 
                repository.findAll(pageable) : 
                repository.findByDeletedAtIsNull(pageable);
        } else {
            String searchTerm = "%" + search.toLowerCase() + "%";

            exercises = includeInactive ?
                    repository.findBySearchTermIncludingInactive(searchTerm, pageable) :
                    repository.findBySearchTermAndDeletedAtIsNull(searchTerm, pageable);
        }
        
        return exercises.map(ExerciseResponseDTO::fromEntity);
    }

    @Transactional
    public ExerciseResponseDTO update(UUID id, ExerciseRequestDTO request) {
        log.debug("Updating exercise [ID: {}] - newName: {}", id, request.name());
        Exercise exercise = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));

        // If the name is different, check if the new name already exists
        if (!exercise.getName().equalsIgnoreCase(request.name())) {
            if (repository.existsByNameIgnoringCaseAndDeletedAtIsNull(request.name())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Exercise already exists");
            }
        }

        exercise.setName(request.name());
        exercise.setDescription(request.description());
        log.info("Exercise updated successfully [ID: {}] - Name: {}", id, exercise.getName());
        return ExerciseResponseDTO.fromEntity(exercise);
    }

    @Transactional
    public void delete(UUID id) {
        log.debug("Deleting exercise [ID: {}]", id);
        Exercise exercise = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));

        exercise.deactivate();
        log.info("Exercise deactivated successfully [ID: {}]", id);
    }

    @Transactional
    public ExerciseResponseDTO restore(UUID id) {
        log.debug("Restoring exercise [ID: {}]", id);
        Exercise exercise = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));
        
        if (exercise.isActive() || repository.existsByNameIgnoringCaseAndDeletedAtIsNull(exercise.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot restore exercise.");
        }

        exercise.activate();
        log.info("Exercise restored successfully [ID: {}]", id);
        return ExerciseResponseDTO.fromEntity(exercise);
    }

    @Transactional
    public ExerciseResponseDTO patch(UUID id, PatchExerciseRequestDTO request) {
        log.debug("Patching exercise [ID: {}]", id);
        Exercise exercise = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));

        if (request.name() != null) {
            if (!exercise.getName().equalsIgnoreCase(request.name()) && 
                repository.existsByNameIgnoringCaseAndDeletedAtIsNull(request.name())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Exercise already exists");
            }
            exercise.setName(request.name());
        }
        
        if (request.description() != null) {
            exercise.setDescription(request.description());
        }

        log.info("Exercise patched successfully [ID: {}]", id);
        return ExerciseResponseDTO.fromEntity(exercise);
    }
}

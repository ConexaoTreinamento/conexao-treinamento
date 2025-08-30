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
public class ExerciseService {
    private final ExerciseRepository repository;

    @Transactional
    public ExerciseResponseDTO create(ExerciseRequestDTO request) {
        if (repository.existsByNameIgnoringCaseAndDeletedAtIsNull(request.name())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Exercise already exists");
        }

        Exercise exercise = new Exercise(request.name(), request.description());
        Exercise saved = repository.save(exercise);
        return ExerciseResponseDTO.fromEntity(saved);
    }

    public ExerciseResponseDTO findById(UUID id) {
        Exercise exercise = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));
        return ExerciseResponseDTO.fromEntity(exercise);
    }

    public Page<ExerciseResponseDTO> findAll(String search, Pageable pageable, boolean includeInactive) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                                    Sort.by("created_at").descending());
        }

        Page<Exercise> exercises;
        if (search == null || search.isBlank()) {
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
        return ExerciseResponseDTO.fromEntity(exercise);
    }

    @Transactional
    public void delete(UUID id) {
        Exercise exercise = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));

        exercise.deactivate();
    }

    @Transactional
    public ExerciseResponseDTO restore(UUID id) {
        Exercise exercise = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));
        
        if (exercise.isActive() || repository.existsByNameIgnoringCaseAndDeletedAtIsNull(exercise.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot restore exercise.");
        }

        exercise.activate();
        return ExerciseResponseDTO.fromEntity(exercise);
    }

    @Transactional
    public ExerciseResponseDTO patch(UUID id, PatchExerciseRequestDTO request) {
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

        return ExerciseResponseDTO.fromEntity(exercise);
    }
}

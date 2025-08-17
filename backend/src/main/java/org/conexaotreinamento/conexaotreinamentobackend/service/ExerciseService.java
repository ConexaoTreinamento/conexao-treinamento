package org.conexaotreinamento.conexaotreinamentobackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.api.dto.request.CreateExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.api.dto.response.ExerciseResponseDTO;
import org.springframework.web.server.ResponseStatusException;

import org.conexaotreinamento.conexaotreinamentobackend.persistence.entity.Exercise;
import org.conexaotreinamento.conexaotreinamentobackend.persistence.repository.ExerciseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExerciseService {
    private final ExerciseRepository repository;

    @Transactional
    public ExerciseResponseDTO create(CreateExerciseRequestDTO request) {
        if (repository.existsByNameIgnoringCase(request.name())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Exercise already exists");
        }

        Exercise exercise = new Exercise(request.name(), request.description());
        Exercise saved = repository.save(exercise);
        return ExerciseResponseDTO.fromEntity(saved);
    }
}

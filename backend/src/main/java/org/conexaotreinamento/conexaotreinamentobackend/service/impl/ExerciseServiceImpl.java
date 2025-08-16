package org.conexaotreinamento.conexaotreinamentobackend.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.api.dto.request.CreateExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.api.dto.response.ExerciseResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.api.exception.BusinessException;
import org.conexaotreinamento.conexaotreinamentobackend.api.mapper.ExerciseMapper;
import org.conexaotreinamento.conexaotreinamentobackend.persistence.entity.Exercise;
import org.conexaotreinamento.conexaotreinamentobackend.persistence.repository.ExerciseRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.ExerciseService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExerciseServiceImpl implements ExerciseService {
    private final ExerciseRepository repository;
    private final ExerciseMapper mapper;

    @Override
    @Transactional
    public ExerciseResponseDTO create(CreateExerciseRequestDTO request) {
        if (repository.existsByNameIgnoringCase(request.name())) {
            throw new BusinessException("Exercise already exists", HttpStatus.CONFLICT);
        }

        Exercise saved = repository.save(mapper.toEntity((request)));
        return mapper.toResponse(saved);
    }
}

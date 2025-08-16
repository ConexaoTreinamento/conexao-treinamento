package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.api.dto.request.CreateExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.api.dto.response.ExerciseResponseDTO;

public interface ExerciseService {
    ExerciseResponseDTO create(CreateExerciseRequestDTO request);
}

package org.conexaotreinamento.conexaotreinamentobackend.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.api.dto.request.CreateExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.api.dto.response.ExerciseResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.ExerciseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/exercises")
@RequiredArgsConstructor
public class ExerciseController {
    private final ExerciseService exerciseService;

    @PostMapping
    public ResponseEntity<ExerciseResponseDTO> create(@RequestBody @Valid CreateExerciseRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(exerciseService.create(request));
    }
}

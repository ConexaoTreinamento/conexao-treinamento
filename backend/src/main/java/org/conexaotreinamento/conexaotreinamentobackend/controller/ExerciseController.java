package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ExerciseResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.ExerciseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/exercises")
@RequiredArgsConstructor
public class ExerciseController {
    private final ExerciseService exerciseService;

    @PostMapping
    public ResponseEntity<ExerciseResponseDTO> createExercise(@RequestBody @Valid ExerciseRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(exerciseService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<ExerciseResponseDTO>> findAllExercises(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(exerciseService.findAll(search, pageable, includeInactive));
    }

    @GetMapping("/{exerciseId}")
    public ResponseEntity<ExerciseResponseDTO> findExerciseById(@PathVariable UUID exerciseId) {
        return ResponseEntity.ok(exerciseService.findById(exerciseId));
    }

    @PutMapping("/{exerciseId}")
    public ResponseEntity<ExerciseResponseDTO> updateExercise(@PathVariable UUID exerciseId, @RequestBody @Valid ExerciseRequestDTO request) {
        return ResponseEntity.ok(exerciseService.update(exerciseId, request));
    }

    @PatchMapping("/{exerciseId}")
    public ResponseEntity<ExerciseResponseDTO> patchExercise(@PathVariable UUID exerciseId, @RequestBody @Valid PatchExerciseRequestDTO request) {
        return ResponseEntity.ok(exerciseService.patch(exerciseId, request));
    }

    @DeleteMapping("/{exerciseId}")
    public ResponseEntity<Void> deleteExercise(@PathVariable UUID exerciseId) {
        exerciseService.delete(exerciseId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{exerciseId}/restore")
    public ResponseEntity<ExerciseResponseDTO> restoreExercise(@PathVariable UUID exerciseId) {
        return ResponseEntity.ok(exerciseService.restore(exerciseId));
    }
}

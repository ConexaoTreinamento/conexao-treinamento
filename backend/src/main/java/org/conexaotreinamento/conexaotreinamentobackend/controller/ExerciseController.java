package org.conexaotreinamento.conexaotreinamentobackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ExerciseResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.ExerciseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/exercises")
@RequiredArgsConstructor
public class ExerciseController {
    private final ExerciseService exerciseService;

    @PostMapping
    public ResponseEntity<ExerciseResponseDTO> create(@RequestBody @Valid ExerciseRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(exerciseService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(exerciseService.findById(id));
    }

    @GetMapping
    public ResponseEntity<Page<ExerciseResponseDTO>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(exerciseService.findAll(search, pageable, includeInactive));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExerciseResponseDTO> update(@PathVariable UUID id, @RequestBody @Valid ExerciseRequestDTO request) {
        return ResponseEntity.ok(exerciseService.update(id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ExerciseResponseDTO> patch(@PathVariable UUID id, @RequestBody @Valid PatchExerciseRequestDTO request) {
        return ResponseEntity.ok(exerciseService.patch(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        exerciseService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ExerciseResponseDTO> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(exerciseService.restore(id));
    }
}

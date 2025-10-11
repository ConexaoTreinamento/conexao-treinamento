package org.conexaotreinamento.conexaotreinamentobackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PhysicalEvaluationRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.PhysicalEvaluationResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.PhysicalEvaluationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/students/{studentId}/evaluations")
@RequiredArgsConstructor
public class PhysicalEvaluationController {

    private final PhysicalEvaluationService evaluationService;

    @PostMapping
    public ResponseEntity<PhysicalEvaluationResponseDTO> createEvaluation(
            @PathVariable UUID studentId,
            @RequestBody @Valid PhysicalEvaluationRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(evaluationService.create(studentId, request));
    }

    @GetMapping("/{evaluationId}")
    public ResponseEntity<PhysicalEvaluationResponseDTO> getEvaluation(@PathVariable UUID evaluationId) {
        return ResponseEntity.ok(evaluationService.findById(evaluationId));
    }

    @GetMapping
    public ResponseEntity<List<PhysicalEvaluationResponseDTO>> getAllEvaluations(@PathVariable UUID studentId) {
        return ResponseEntity.ok(evaluationService.findAllByStudentId(studentId));
    }

    @PutMapping("/{evaluationId}")
    public ResponseEntity<PhysicalEvaluationResponseDTO> updateEvaluation(
            @PathVariable UUID evaluationId,
            @RequestBody @Valid PhysicalEvaluationRequestDTO request) {
        return ResponseEntity.ok(evaluationService.update(evaluationId, request));
    }

    @DeleteMapping("/{evaluationId}")
    public ResponseEntity<Void> deleteEvaluation(@PathVariable UUID evaluationId) {
        evaluationService.delete(evaluationId);
        return ResponseEntity.noContent().build();
    }
}


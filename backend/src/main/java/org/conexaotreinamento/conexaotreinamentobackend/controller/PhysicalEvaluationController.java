package org.conexaotreinamento.conexaotreinamentobackend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PhysicalEvaluationRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.PhysicalEvaluationResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.PhysicalEvaluationService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing physical evaluations of students.
 * Nested resource under /students/{studentId}/evaluations
 */
@RestController
@RequestMapping("/students/{studentId}/evaluations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Physical Evaluations", description = "Physical evaluation management for students")
public class PhysicalEvaluationController {

    private final PhysicalEvaluationService evaluationService;

    @PostMapping
    @Operation(summary = "Create physical evaluation", description = "Creates a new physical evaluation for a student")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Evaluation created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Student not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<PhysicalEvaluationResponseDTO> createEvaluation(
            @PathVariable @Parameter(description = "Student ID") UUID studentId,
            @RequestBody @Valid @Parameter(description = "Physical evaluation data") PhysicalEvaluationRequestDTO request) {
        
        log.info("Creating physical evaluation for student [ID: {}]", studentId);
        PhysicalEvaluationResponseDTO response = evaluationService.create(studentId, request);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        
        log.info("Physical evaluation created successfully [ID: {}]", response.id());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{evaluationId}")
    @Operation(summary = "Get physical evaluation", description = "Retrieves a specific physical evaluation")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Evaluation found"),
        @ApiResponse(responseCode = "404", description = "Evaluation or student not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<PhysicalEvaluationResponseDTO> getEvaluation(
            @PathVariable @Parameter(description = "Student ID") UUID studentId,
            @PathVariable @Parameter(description = "Evaluation ID") UUID evaluationId) {
        
        log.debug("Finding physical evaluation [ID: {}] for student [ID: {}]", evaluationId, studentId);
        PhysicalEvaluationResponseDTO response = evaluationService.findById(studentId, evaluationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List student evaluations", description = "Retrieves all physical evaluations for a student")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Evaluations retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Student not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<PhysicalEvaluationResponseDTO>> getAllEvaluations(
            @PathVariable @Parameter(description = "Student ID") UUID studentId) {
        
        log.debug("Finding all physical evaluations for student [ID: {}]", studentId);
        List<PhysicalEvaluationResponseDTO> response = evaluationService.findAllByStudentId(studentId);
        log.debug("Found {} evaluations", response.size());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{evaluationId}")
    @Operation(summary = "Update physical evaluation", description = "Updates an existing physical evaluation")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Evaluation updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Evaluation or student not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<PhysicalEvaluationResponseDTO> updateEvaluation(
            @PathVariable @Parameter(description = "Student ID") UUID studentId,
            @PathVariable @Parameter(description = "Evaluation ID") UUID evaluationId,
            @RequestBody @Valid @Parameter(description = "Updated evaluation data") PhysicalEvaluationRequestDTO request) {
        
        log.info("Updating physical evaluation [ID: {}] for student [ID: {}]", evaluationId, studentId);
        PhysicalEvaluationResponseDTO response = evaluationService.update(studentId, evaluationId, request);
        log.info("Physical evaluation updated successfully [ID: {}]", evaluationId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{evaluationId}")
    @Operation(summary = "Delete physical evaluation", description = "Soft deletes a physical evaluation")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Evaluation deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Evaluation or student not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteEvaluation(
            @PathVariable @Parameter(description = "Student ID") UUID studentId,
            @PathVariable @Parameter(description = "Evaluation ID") UUID evaluationId) {
        
        log.info("Deleting physical evaluation [ID: {}] for student [ID: {}]", evaluationId, studentId);
        evaluationService.delete(studentId, evaluationId);
        log.info("Physical evaluation deleted successfully [ID: {}]", evaluationId);
        return ResponseEntity.noContent().build();
    }
}


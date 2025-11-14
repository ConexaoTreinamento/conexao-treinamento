package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.BulkCommitmentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentCommitmentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.CommitmentDetailResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentCommitment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.StudentCommitmentMapper;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerScheduleRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentCommitmentService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.ErrorResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

/**
 * REST controller for managing student commitments to training sessions.
 * Handles booking, cancellation, and status tracking of recurring sessions.
 */
@RestController
@RequestMapping("/commitments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Student Commitments", description = "Student commitment and booking management")
public class StudentCommitmentController {
    
    private final StudentCommitmentService studentCommitmentService;
    private final TrainerScheduleRepository trainerScheduleRepository;
    private final StudentCommitmentMapper commitmentMapper;
    
    @PostMapping("/students/{studentId}/sessions/{sessionSeriesId}")
    @Operation(summary = "Update commitment", description = "Updates a student's commitment status for a session series")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Commitment updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Student or session not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<CommitmentDetailResponseDTO> updateCommitment(
            @PathVariable @Parameter(description = "Student ID") UUID studentId,
            @PathVariable @Parameter(description = "Session series ID") UUID sessionSeriesId,
            @Valid @RequestBody @Parameter(description = "Commitment update request") StudentCommitmentRequestDTO request) {
        
        log.info("Updating commitment for student [ID: {}] - Session [ID: {}] - Status: {}", 
                studentId, sessionSeriesId, request.commitmentStatus());
        StudentCommitment commitment = studentCommitmentService.updateCommitment(
                studentId, sessionSeriesId, request.commitmentStatus(), request.effectiveFromTimestamp());
        log.info("Commitment updated successfully [ID: {}]", commitment.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(commitmentMapper.toDetailResponse(commitment));
    }
    
    @GetMapping("/students/{studentId}/sessions/{sessionSeriesId}/status")
    @Operation(summary = "Get commitment status", description = "Retrieves current commitment status for a student and session")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status retrieved successfully")
    })
    public ResponseEntity<CommitmentStatus> getCurrentCommitmentStatus(
            @PathVariable @Parameter(description = "Student ID") UUID studentId,
            @PathVariable @Parameter(description = "Session series ID") UUID sessionSeriesId,
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @Parameter(description = "Timestamp to query (defaults to now)") 
            LocalDateTime timestamp) {
        
        Instant queryTime = timestamp != null ? timestamp.toInstant(ZoneOffset.UTC) : Instant.now();
        log.debug("Fetching commitment status for student [ID: {}] - Session [ID: {}] at {}", 
                studentId, sessionSeriesId, queryTime);
        CommitmentStatus status = studentCommitmentService.getCurrentCommitmentStatus(
                studentId, sessionSeriesId, queryTime);
        return ResponseEntity.ok(status);
    }
    
    @GetMapping("/students/{studentId}")
    @Operation(summary = "Get student commitments", description = "Retrieves all commitments for a student")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Commitments retrieved successfully")
    })
    public ResponseEntity<List<CommitmentDetailResponseDTO>> getStudentCommitments(
            @PathVariable @Parameter(description = "Student ID") UUID studentId) {
        
        log.debug("Fetching all commitments for student [ID: {}]", studentId);
        List<StudentCommitment> commitments = studentCommitmentService.getStudentCommitments(studentId);
        List<CommitmentDetailResponseDTO> response = commitments.stream()
                .map(commitmentMapper::toDetailResponse)
                .toList();
        log.debug("Retrieved {} commitments", response.size());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/sessions/{sessionSeriesId}")
    @Operation(summary = "Get session commitments", description = "Retrieves all commitments for a session series")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Commitments retrieved successfully")
    })
    public ResponseEntity<List<CommitmentDetailResponseDTO>> getSessionSeriesCommitments(
            @PathVariable @Parameter(description = "Session series ID") UUID sessionSeriesId) {
        
        log.debug("Fetching all commitments for session series [ID: {}]", sessionSeriesId);
        List<StudentCommitment> commitments = studentCommitmentService.getSessionSeriesCommitments(sessionSeriesId);
        List<CommitmentDetailResponseDTO> response = commitments.stream()
                .map(commitmentMapper::toDetailResponse)
                .toList();
        log.debug("Retrieved {} commitments", response.size());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/students/{studentId}/active")
    @Operation(summary = "Get active commitments", description = "Retrieves current active commitments for a student")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Active commitments retrieved successfully")
    })
    public ResponseEntity<List<CommitmentDetailResponseDTO>> getCurrentActiveCommitments(
            @PathVariable @Parameter(description = "Student ID") UUID studentId,
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @Parameter(description = "Timestamp to query (defaults to now)")
            LocalDateTime timestamp) {
        
        Instant queryTime = timestamp != null ? timestamp.toInstant(ZoneOffset.UTC) : Instant.now();
        log.debug("Fetching active commitments for student [ID: {}] at {}", studentId, queryTime);
        List<StudentCommitment> commitments = studentCommitmentService.getCurrentActiveCommitments(studentId, queryTime);
        List<CommitmentDetailResponseDTO> response = commitments.stream()
                .map(commitmentMapper::toDetailResponse)
                .toList();
        log.debug("Retrieved {} active commitments", response.size());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/students/{studentId}/sessions/{sessionSeriesId}/history")
    @Operation(summary = "Get commitment history", description = "Retrieves commitment history for a student and session series")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "History retrieved successfully")
    })
    public ResponseEntity<List<CommitmentDetailResponseDTO>> getCommitmentHistory(
            @PathVariable @Parameter(description = "Student ID") UUID studentId,
            @PathVariable @Parameter(description = "Session series ID") UUID sessionSeriesId) {
        
        log.debug("Fetching commitment history for student [ID: {}] - Session [ID: {}]", studentId, sessionSeriesId);
        List<StudentCommitment> commitments = studentCommitmentService.getCommitmentHistory(studentId, sessionSeriesId);
        List<CommitmentDetailResponseDTO> response = commitments.stream()
                .map(commitmentMapper::toDetailResponse)
                .toList();
        log.debug("Retrieved {} commitment history entries", response.size());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/students/{studentId}/bulk")
    @Operation(summary = "Bulk update commitments", description = "Updates multiple commitments at once (e.g., book all sessions)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Commitments updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<CommitmentDetailResponseDTO>> bulkUpdateCommitments(
            @PathVariable @Parameter(description = "Student ID") UUID studentId,
            @Valid @RequestBody @Parameter(description = "Bulk commitment update request") BulkCommitmentRequestDTO request) {
        
        log.info("Bulk updating commitments for student [ID: {}] - {} sessions - Status: {}", 
                studentId, request.sessionSeriesIds().size(), request.commitmentStatus());
        List<StudentCommitment> commitments = studentCommitmentService.bulkUpdateCommitments(
                studentId, request.sessionSeriesIds(), request.commitmentStatus(), request.effectiveFromTimestamp());
        List<CommitmentDetailResponseDTO> response = commitments.stream()
                .map(commitmentMapper::toDetailResponse)
                .toList();
        log.info("Bulk update completed - {} commitments updated", response.size());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/available-sessions")
    @Operation(summary = "Get available sessions", description = "Retrieves all available session series for booking")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Available sessions retrieved successfully")
    })
    public ResponseEntity<List<TrainerSchedule>> getAvailableSessionSeries() {
        log.debug("Fetching all available session series");
        List<TrainerSchedule> activeSeries = trainerScheduleRepository.findByActiveTrue();
        log.debug("Retrieved {} available session series", activeSeries.size());
        return ResponseEntity.ok(activeSeries);
    }
}

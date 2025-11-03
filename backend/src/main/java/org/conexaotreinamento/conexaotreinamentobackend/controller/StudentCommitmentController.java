package org.conexaotreinamento.conexaotreinamentobackend.controller;

import jakarta.validation.Valid;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.BulkCommitmentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentCommitmentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.CommitmentDetailResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentCommitment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerScheduleRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentCommitmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class StudentCommitmentController {
    
    @Autowired
    private StudentCommitmentService studentCommitmentService;
    
    @Autowired
    private TrainerScheduleRepository trainerScheduleRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    // Update single commitment
    @PostMapping("/students/{studentId}/commitments/sessions/{sessionSeriesId}")
    public ResponseEntity<CommitmentDetailResponseDTO> updateCommitment(
            @PathVariable UUID studentId,
            @PathVariable UUID sessionSeriesId,
            @Valid @RequestBody StudentCommitmentRequestDTO request) {
        StudentCommitment commitment = studentCommitmentService.updateCommitment(
            studentId, sessionSeriesId, request.getCommitmentStatus(), request.getEffectiveFromTimestamp());
        CommitmentDetailResponseDTO response = convertToDetailResponseDTO(commitment);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // Get current commitment status for a student and session at a specific time
    @GetMapping("/students/{studentId}/commitments/sessions/{sessionSeriesId}/status")
    public ResponseEntity<CommitmentStatus> getCurrentCommitmentStatus(
            @PathVariable UUID studentId,
            @PathVariable UUID sessionSeriesId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime timestamp) {
        
        Instant queryTime = timestamp != null ? timestamp.toInstant(ZoneOffset.UTC) : Instant.now();
        CommitmentStatus status = studentCommitmentService.getCurrentCommitmentStatus(
            studentId, sessionSeriesId, queryTime);
        
        return ResponseEntity.ok(status);
    }
    
    // Get all commitments for a student
    @GetMapping("/students/{studentId}/commitments")
    public ResponseEntity<List<CommitmentDetailResponseDTO>> getStudentCommitments(
            @PathVariable UUID studentId) {
        
        List<StudentCommitment> commitments = studentCommitmentService.getStudentCommitments(studentId);
        List<CommitmentDetailResponseDTO> response = commitments.stream()
            .map(this::convertToDetailResponseDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    // Get all commitments for a session series
    @GetMapping("/schedules/{sessionSeriesId}/commitments")
    public ResponseEntity<List<CommitmentDetailResponseDTO>> getSessionSeriesCommitments(
            @PathVariable UUID sessionSeriesId) {
        
        List<StudentCommitment> commitments = studentCommitmentService.getSessionSeriesCommitments(sessionSeriesId);
        List<CommitmentDetailResponseDTO> response = commitments.stream()
            .map(this::convertToDetailResponseDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    // Get current active commitments for a student (ATTENDING status)
    @GetMapping("/students/{studentId}/commitments/active")
    public ResponseEntity<List<CommitmentDetailResponseDTO>> getCurrentActiveCommitments(
            @PathVariable UUID studentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime timestamp) {
        
        Instant queryTime = timestamp != null ? timestamp.toInstant(ZoneOffset.UTC) : Instant.now();
        List<StudentCommitment> commitments = studentCommitmentService.getCurrentActiveCommitments(studentId, queryTime);
        List<CommitmentDetailResponseDTO> response = commitments.stream()
            .map(this::convertToDetailResponseDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    // Get commitment history for a student and session series
    @GetMapping("/students/{studentId}/commitments/sessions/{sessionSeriesId}/history")
    public ResponseEntity<List<CommitmentDetailResponseDTO>> getCommitmentHistory(
            @PathVariable UUID studentId,
            @PathVariable UUID sessionSeriesId) {
        
        List<StudentCommitment> commitments = studentCommitmentService.getCommitmentHistory(studentId, sessionSeriesId);
        List<CommitmentDetailResponseDTO> response = commitments.stream()
            .map(this::convertToDetailResponseDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    // Bulk update commitments (e.g., "book all sessions", "this and following")
    @PostMapping("/students/{studentId}/commitments/bulk")
    public ResponseEntity<List<CommitmentDetailResponseDTO>> bulkUpdateCommitments(
            @PathVariable UUID studentId,
            @Valid @RequestBody BulkCommitmentRequestDTO request) {
        List<StudentCommitment> commitments = studentCommitmentService.bulkUpdateCommitments(
            studentId, request.getSessionSeriesIds(), request.getCommitmentStatus(), request.getEffectiveFromTimestamp());
        List<CommitmentDetailResponseDTO> response = commitments.stream()
            .map(this::convertToDetailResponseDTO)
            .collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // Utility endpoint: Get all available session series (for booking UI)
    @GetMapping("/commitments/available-sessions")
    public ResponseEntity<List<TrainerSchedule>> getAvailableSessionSeries() {
        List<TrainerSchedule> activeSeries = trainerScheduleRepository.findByActiveTrue();
        return ResponseEntity.ok(activeSeries);
    }
    
    // Convert entity to detailed response DTO
    private CommitmentDetailResponseDTO convertToDetailResponseDTO(StudentCommitment commitment) {
        CommitmentDetailResponseDTO dto = new CommitmentDetailResponseDTO();
        dto.setId(commitment.getId());
        dto.setStudentId(commitment.getStudentId());
        dto.setSessionSeriesId(commitment.getSessionSeriesId());
        dto.setCommitmentStatus(commitment.getCommitmentStatus());
        dto.setEffectiveFromTimestamp(commitment.getEffectiveFromTimestamp());
        dto.setCreatedAt(commitment.getCreatedAt());
        
        // Enrich with student name
        Optional<Student> student = studentRepository.findById(commitment.getStudentId());
        student.ifPresent(s -> dto.setStudentName(s.getName()));
        
        // Enrich with series name
        Optional<TrainerSchedule> schedule = trainerScheduleRepository.findById(commitment.getSessionSeriesId());
        schedule.ifPresent(s -> dto.setSeriesName(s.getSeriesName()));
        
        return dto;
    }
}

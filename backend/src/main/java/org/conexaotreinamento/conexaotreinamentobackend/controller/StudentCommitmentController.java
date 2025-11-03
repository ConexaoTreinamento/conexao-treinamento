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
@RequestMapping("/commitments")
public class StudentCommitmentController {
    
    @Autowired
    private StudentCommitmentService studentCommitmentService;
    
    @Autowired
    private TrainerScheduleRepository trainerScheduleRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    // Update single commitment
    @PostMapping("/students/{studentId}/sessions/{sessionSeriesId}")
    public ResponseEntity<CommitmentDetailResponseDTO> updateCommitment(
            @PathVariable UUID studentId,
            @PathVariable UUID sessionSeriesId,
            @Valid @RequestBody StudentCommitmentRequestDTO request) {
        StudentCommitment commitment = studentCommitmentService.updateCommitment(
            studentId, sessionSeriesId, request.commitmentStatus(), request.effectiveFromTimestamp());
        CommitmentDetailResponseDTO response = convertToDetailResponseDTO(commitment);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // Get current commitment status for a student and session at a specific time
    @GetMapping("/students/{studentId}/sessions/{sessionSeriesId}/status")
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
    @GetMapping("/students/{studentId}")
    public ResponseEntity<List<CommitmentDetailResponseDTO>> getStudentCommitments(
            @PathVariable UUID studentId) {
        
        List<StudentCommitment> commitments = studentCommitmentService.getStudentCommitments(studentId);
        List<CommitmentDetailResponseDTO> response = commitments.stream()
            .map(this::convertToDetailResponseDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    // Get all commitments for a session series
    @GetMapping("/sessions/{sessionSeriesId}")
    public ResponseEntity<List<CommitmentDetailResponseDTO>> getSessionSeriesCommitments(
            @PathVariable UUID sessionSeriesId) {
        
        List<StudentCommitment> commitments = studentCommitmentService.getSessionSeriesCommitments(sessionSeriesId);
        List<CommitmentDetailResponseDTO> response = commitments.stream()
            .map(this::convertToDetailResponseDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    // Get current active commitments for a student (ATTENDING status)
    @GetMapping("/students/{studentId}/active")
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
    @GetMapping("/students/{studentId}/sessions/{sessionSeriesId}/history")
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
    @PostMapping("/students/{studentId}/bulk")
    public ResponseEntity<List<CommitmentDetailResponseDTO>> bulkUpdateCommitments(
            @PathVariable UUID studentId,
            @Valid @RequestBody BulkCommitmentRequestDTO request) {
        List<StudentCommitment> commitments = studentCommitmentService.bulkUpdateCommitments(
            studentId, request.sessionSeriesIds(), request.commitmentStatus(), request.effectiveFromTimestamp());
        List<CommitmentDetailResponseDTO> response = commitments.stream()
            .map(this::convertToDetailResponseDTO)
            .collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // Utility endpoint: Get all available session series (for booking UI)
    @GetMapping("/available-sessions")
    public ResponseEntity<List<TrainerSchedule>> getAvailableSessionSeries() {
        List<TrainerSchedule> activeSeries = trainerScheduleRepository.findByActiveTrue();
        return ResponseEntity.ok(activeSeries);
    }
    
    // Convert entity to detailed response DTO
    private CommitmentDetailResponseDTO convertToDetailResponseDTO(StudentCommitment commitment) {
        Optional<Student> student = studentRepository.findById(commitment.getStudentId());
        Optional<TrainerSchedule> schedule = trainerScheduleRepository.findById(commitment.getSessionSeriesId());

        return new CommitmentDetailResponseDTO(
            commitment.getId(),
            commitment.getStudentId(),
            student.map(Student::getName).orElse(null),
            commitment.getSessionSeriesId(),
            schedule.map(TrainerSchedule::getSeriesName).orElse(null),
            commitment.getCommitmentStatus(),
            commitment.getEffectiveFromTimestamp(),
            commitment.getCreatedAt()
        );
    }
}

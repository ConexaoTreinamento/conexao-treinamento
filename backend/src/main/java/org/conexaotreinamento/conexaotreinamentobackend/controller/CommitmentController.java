package org.conexaotreinamento.conexaotreinamentobackend.controller;

import jakarta.validation.Valid;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CommitmentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentCommitment;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentCommitmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.CommitmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/commitments")
public class CommitmentController {

    @Autowired
    private CommitmentService commitmentService;

    @Autowired
    private StudentCommitmentRepository commitmentRepository;

    @PostMapping("/students/{studentId}")
    public ResponseEntity<StudentCommitment> createCommitment(
            @PathVariable UUID studentId,
            @Valid @RequestBody CommitmentRequestDTO requestDTO) {

        Instant effectiveTo = requestDTO.getEffectiveToTimestamp();
        StudentCommitment created = commitmentService.createSeriesCommitment(
                studentId,
                requestDTO.getSessionSeriesId(),
                requestDTO.getCommitmentStatus(),
                requestDTO.getEffectiveFromTimestamp(),
                effectiveTo
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/students/{studentId}/series/{seriesId}")
    public ResponseEntity<List<StudentCommitment>> getCommitmentsAt(
            @PathVariable UUID studentId,
            @PathVariable UUID seriesId,
            @RequestParam(required = false) Instant timestamp) {

        Instant ts = timestamp == null ? Instant.now() : timestamp;
        List<StudentCommitment> commitments = commitmentService.getCommitmentsAt(studentId, seriesId, ts);
        return ResponseEntity.ok(commitments);
    }

    public static class SplitRequestDTO {
        public Instant splitFrom;
        public CommitmentStatus commitmentStatus;
    }

    @PostMapping("/{commitmentId}/split")
    public ResponseEntity<StudentCommitment> splitCommitment(
            @PathVariable UUID commitmentId,
            @RequestBody SplitRequestDTO splitRequest) {

        Optional<StudentCommitment> originalOpt = commitmentRepository.findById(commitmentId);
        if (originalOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        StudentCommitment original = originalOpt.get();

        if (splitRequest.splitFrom == null) {
            return ResponseEntity.badRequest().build();
        }

        // If no new status provided, keep the original status for the new commitment
        CommitmentStatus status = splitRequest.commitmentStatus != null
                ? splitRequest.commitmentStatus
                : original.getCommitmentStatus();

        StudentCommitment created = commitmentService.splitCommitment(original, splitRequest.splitFrom, status);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}

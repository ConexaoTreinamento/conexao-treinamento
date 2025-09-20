package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentCommitment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlanAssignment;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentCommitmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StudentCommitmentService {
    
    @Autowired
    private StudentCommitmentRepository studentCommitmentRepository;
    
    @Autowired
    private StudentPlanService studentPlanService;
    
    // Get current commitment status for a student and session series at a specific time
    public CommitmentStatus getCurrentCommitmentStatus(UUID studentId, UUID sessionSeriesId, Instant timestamp) {
        List<StudentCommitment> commitments = studentCommitmentRepository
            .findByStudentIdAndSessionSeriesIdAndEffectiveFromTimestampLessThanEqualOrderByEffectiveFromTimestampDesc(
                studentId, sessionSeriesId, timestamp);
        
        if (commitments.isEmpty()) {
            return CommitmentStatus.NOT_ATTENDING; // Default status
        }
        
        return commitments.getFirst().getCommitmentStatus(); // Most recent commitment
    }
    
    // Update student commitment (event sourcing - creates new record)
    public StudentCommitment updateCommitment(UUID studentId, UUID sessionSeriesId, CommitmentStatus status) {
        // Validate against current plan limits
        if (status == CommitmentStatus.ATTENDING) {
            validatePlanLimits(studentId);
        }
        
        StudentCommitment commitment = new StudentCommitment();
        commitment.setStudentId(studentId);
        commitment.setSessionSeriesId(sessionSeriesId);
        commitment.setCommitmentStatus(status);
        commitment.setEffectiveFromTimestamp(Instant.now());
        
        return studentCommitmentRepository.save(commitment);
    }
    
    // Get all commitments for a student
    public List<StudentCommitment> getStudentCommitments(UUID studentId) {
        return studentCommitmentRepository.findByStudentId(studentId);
    }
    
    // Get all commitments for a session series
    public List<StudentCommitment> getSessionSeriesCommitments(UUID sessionSeriesId) {
        return studentCommitmentRepository.findBySessionSeriesId(sessionSeriesId);
    }
    
    // Get current active commitments for a student (ATTENDING status)
    public List<StudentCommitment> getCurrentActiveCommitments(UUID studentId, Instant timestamp) {
        return studentCommitmentRepository
            .findByStudentIdAndCommitmentStatusAndEffectiveFromTimestampLessThanEqual(
                studentId, CommitmentStatus.ATTENDING, timestamp);
    }
    
    // Temporal query: Get commitment history for a student and session series
    public List<StudentCommitment> getCommitmentHistory(UUID studentId, UUID sessionSeriesId) {
        return studentCommitmentRepository
            .findByStudentIdAndSessionSeriesIdAndEffectiveFromTimestampLessThanEqualOrderByEffectiveFromTimestampDesc(
                studentId, sessionSeriesId, Instant.now());
    }
    
    // Validate plan limits before allowing new ATTENDING commitments
    private void validatePlanLimits(UUID studentId) {
        // Get current active plan
        Optional<StudentPlanAssignment> currentPlan = studentPlanService.getCurrentAssignment(studentId);
        
        if (currentPlan.isEmpty()) {
            throw new RuntimeException("Student has no active plan");
        }
        
        // Count current active commitments
        List<StudentCommitment> activeCommitments = getCurrentActiveCommitments(studentId, Instant.now());
        int currentCommitmentCount = activeCommitments.size();
        
        // Check against plan limits
        int maxDays = currentPlan.get().getPlan().getMaxDays();
        if (currentCommitmentCount >= maxDays) {
            throw new RuntimeException(
                String.format("Student has reached maximum commitment limit (%d) for current plan", maxDays));
        }
    }
    
    // Bulk update commitments (e.g., "book all sessions", "this and following")
    public List<StudentCommitment> bulkUpdateCommitments(UUID studentId, List<UUID> sessionSeriesIds, 
                                                         CommitmentStatus status) {
        if (status == CommitmentStatus.ATTENDING) {
            validateBulkPlanLimits(studentId, sessionSeriesIds);
        }
        
        return sessionSeriesIds.stream()
            .map(seriesId -> updateCommitment(studentId, seriesId, status))
            .collect(Collectors.toList());
    }
    
    private void validateBulkPlanLimits(UUID studentId, List<UUID> sessionSeriesIds) {
        Optional<StudentPlanAssignment> currentPlan = studentPlanService.getCurrentAssignment(studentId);
        
        if (currentPlan.isEmpty()) {
            throw new RuntimeException("Student has no active plan");
        }
        
        List<StudentCommitment> activeCommitments = getCurrentActiveCommitments(studentId, Instant.now());
        int currentCommitmentCount = activeCommitments.size();
        int maxDays = currentPlan.get().getPlan().getMaxDays();
        
        if (currentCommitmentCount + sessionSeriesIds.size() > maxDays) {
            throw new RuntimeException(
                String.format("Bulk commitment would exceed maximum limit (%d) for current plan. Current: %d, Requested: %d", 
                    maxDays, currentCommitmentCount, sessionSeriesIds.size()));
        }
    }
}

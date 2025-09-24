package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentCommitment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlanAssignment;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentCommitmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class CommitmentService {
    
    private final StudentCommitmentRepository studentCommitmentRepository;
    private final StudentPlanAssignmentRepository studentPlanAssignmentRepository;
    
    @Autowired
    public CommitmentService(StudentCommitmentRepository studentCommitmentRepository, StudentPlanAssignmentRepository studentPlanAssignmentRepository) {
        this.studentCommitmentRepository = studentCommitmentRepository;
        this.studentPlanAssignmentRepository = studentPlanAssignmentRepository;
    }
    
    public StudentCommitment createSeriesCommitment(UUID studentId, UUID sessionSeriesId, CommitmentStatus status, Instant effectiveFrom, Instant effectiveTo) {
        // Validate plan active at the commitment effectiveFrom timestamp (temporal consistency)
        StudentPlanAssignment activePlan = getActivePlanAt(studentId, effectiveFrom);
        if (activePlan == null) {
            throw new IllegalStateException("No active plan for student at the provided effectiveFrom timestamp");
        }

        // Count existing commitments in the assignment (plan) period
        long currentCommitments = countActiveCommitmentsInPeriod(studentId, activePlan.getEffectiveFromTimestamp(), activePlan.getEffectiveToTimestamp());
        if (currentCommitments >= activePlan.getPlan().getMaxDays()) {
            throw new IllegalStateException("Exceeds plan limit");
        }

        // Validate timestamps
        if (effectiveTo != null && effectiveTo.isBefore(effectiveFrom)) {
            throw new IllegalArgumentException("effectiveTo must be after effectiveFrom");
        }

        StudentCommitment commitment = new StudentCommitment();
        commitment.setStudentId(studentId);
        commitment.setSessionSeriesId(sessionSeriesId);
        commitment.setCommitmentStatus(status);
        commitment.setEffectiveFromTimestamp(effectiveFrom);
        commitment.setEffectiveToTimestamp(effectiveTo);
        commitment.setCreatedAt(Instant.now());

        return studentCommitmentRepository.save(commitment);
    }
    
    public List<StudentCommitment> getCommitmentsAt(UUID studentId, UUID seriesId, Instant timestamp) {
        return studentCommitmentRepository.findByStudentIdAndSessionSeriesIdAndEffectiveFromTimestampBeforeOrderByEffectiveFromTimestampDesc(
            studentId, seriesId, timestamp);
    }
    
    public StudentPlanAssignment getActivePlanAt(UUID studentId, Instant timestamp) {
        // Find the latest assignment effective at timestamp
        List<StudentPlanAssignment> assignments = studentPlanAssignmentRepository.findByStudentIdAndEffectiveFromTimestampBeforeOrderByEffectiveFromTimestampDesc(
            studentId, timestamp);
        if (assignments.isEmpty()) {
            return null;
        }
        StudentPlanAssignment assignment = assignments.get(0);
        // Check if still within effective_to
        if (timestamp.isAfter(assignment.getEffectiveToTimestamp())) {
            return null;
        }
        return assignment;
    }
    
    private long countActiveCommitmentsInPeriod(UUID studentId, Instant from, Instant to) {
        // Query count of commitments effective within period
        return studentCommitmentRepository.countByStudentIdAndEffectiveFromTimestampBetweenAndCommitmentStatusNot(
            studentId, from, to, CommitmentStatus.NOT_ATTENDING);
    }
    
    // For "this and following" split
    public StudentCommitment splitCommitment(StudentCommitment original, Instant splitFrom, CommitmentStatus newStatus) {
        // End original at splitFrom (set its effectiveTo)
        original.setEffectiveToTimestamp(splitFrom);
        studentCommitmentRepository.save(original);

        // Create new for following
        StudentCommitment newCommitment = new StudentCommitment();
        newCommitment.setStudentId(original.getStudentId());
        newCommitment.setSessionSeriesId(original.getSessionSeriesId());
        newCommitment.setCommitmentStatus(newStatus);
        newCommitment.setEffectiveFromTimestamp(splitFrom);
        newCommitment.setCreatedAt(Instant.now());

        return studentCommitmentRepository.save(newCommitment);
    }
}

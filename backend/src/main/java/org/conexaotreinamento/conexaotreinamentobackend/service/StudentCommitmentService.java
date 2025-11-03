package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentCommitment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlanAssignment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentCommitmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerScheduleRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanAssignmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.util.Map;

@Service
public class StudentCommitmentService {
    
    @Autowired
    private StudentCommitmentRepository studentCommitmentRepository;
    
    @Autowired
    private TrainerScheduleRepository trainerScheduleRepository;
    
    @Autowired
    private StudentPlanRepository studentPlanRepository;

    @Autowired
    private StudentPlanAssignmentRepository studentPlanAssignmentRepository;
    
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
        return updateCommitment(studentId, sessionSeriesId, status, null);
    }
    
    // Update student commitment with custom effective timestamp (event sourcing - creates new record)
    public StudentCommitment updateCommitment(UUID studentId, UUID sessionSeriesId, CommitmentStatus status, Instant effectiveFromTimestamp) {
        if (status == CommitmentStatus.ATTENDING) {
            validatePlanLimitsForSingle(studentId, sessionSeriesId);
        }
        
        StudentCommitment commitment = new StudentCommitment();
        commitment.setStudentId(studentId);
        commitment.setSessionSeriesId(sessionSeriesId);
        commitment.setCommitmentStatus(status);
        commitment.setEffectiveFromTimestamp(effectiveFromTimestamp != null ? effectiveFromTimestamp : Instant.now());
        
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
        Map<UUID, StudentCommitment> latestPerSeries = buildLatestPerSeries(studentId, timestamp);
        return latestPerSeries.values().stream()
            .filter(c -> c.getCommitmentStatus() == CommitmentStatus.ATTENDING)
            .collect(Collectors.toList());
    }
    
    // Temporal query: Get commitment history for a student and session series
    public List<StudentCommitment> getCommitmentHistory(UUID studentId, UUID sessionSeriesId) {
        return studentCommitmentRepository
            .findByStudentIdAndSessionSeriesIdAndEffectiveFromTimestampLessThanEqualOrderByEffectiveFromTimestampDesc(
                studentId, sessionSeriesId, Instant.now());
    }
    
    // Validate plan limits before allowing new ATTENDING commitments
    private void validatePlanLimitsForSingle(UUID studentId, UUID targetSeriesId) {
    Optional<StudentPlanAssignment> currentPlan = studentPlanAssignmentRepository.findCurrentActiveAssignment(studentId);
        if (currentPlan.isEmpty()) {
            throw new RuntimeException("Student has no active plan");
        }
        // Fetch plan without touching lazy relation on assignment
        int maxDays = studentPlanRepository.findById(currentPlan.get().getPlanId())
            .map(org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlan::getMaxDays)
            .orElseThrow(() -> new RuntimeException("Plano associado não encontrado ou inativo"));
        Instant now = Instant.now();

        Map<UUID, StudentCommitment> latestPerSeries = buildLatestPerSeries(studentId, now);
        java.util.Set<Integer> activeWeekdays = new java.util.HashSet<>();
        for (StudentCommitment c : latestPerSeries.values()) {
            if (c.getCommitmentStatus() == CommitmentStatus.ATTENDING) {
                trainerScheduleRepository.findById(c.getSessionSeriesId())
                    .map(TrainerSchedule::getWeekday)
                    .ifPresent(activeWeekdays::add);
            }
        }
        StudentCommitment currentTarget = latestPerSeries.get(targetSeriesId);
        if (currentTarget != null && currentTarget.getCommitmentStatus() == CommitmentStatus.ATTENDING) {
            return; // already counted
        }
        int targetWeekday = trainerScheduleRepository.findById(targetSeriesId)
            .map(TrainerSchedule::getWeekday)
            .orElseThrow(() -> new RuntimeException("Trainer schedule not found"));
        if (!activeWeekdays.contains(targetWeekday) && activeWeekdays.size() >= maxDays) {
            throw new RuntimeException(String.format("Adicionando este compromisso excede o limite de %d dias do plano", maxDays));
        }
    }
    
    // Bulk update commitments (e.g., "book all sessions", "this and following")
    public List<StudentCommitment> bulkUpdateCommitments(UUID studentId, List<UUID> sessionSeriesIds, 
                                                         CommitmentStatus status) {
        return bulkUpdateCommitments(studentId, sessionSeriesIds, status, null);
    }
    
    // Bulk update commitments with custom effective timestamp
    public List<StudentCommitment> bulkUpdateCommitments(UUID studentId, List<UUID> sessionSeriesIds, 
                                                         CommitmentStatus status, Instant effectiveFromTimestamp) {
        if (status == CommitmentStatus.ATTENDING) {
            validateBulkPlanLimits(studentId, sessionSeriesIds);
        }
        
        return sessionSeriesIds.stream()
            .map(seriesId -> updateCommitment(studentId, seriesId, status, effectiveFromTimestamp))
            .collect(Collectors.toList());
    }
    
    private void validateBulkPlanLimits(UUID studentId, List<UUID> sessionSeriesIds) {
    Optional<StudentPlanAssignment> currentPlan = studentPlanAssignmentRepository.findCurrentActiveAssignment(studentId);
        if (currentPlan.isEmpty()) {
            throw new RuntimeException("Student has no active plan");
        }
        int maxDays = studentPlanRepository.findById(currentPlan.get().getPlanId())
            .map(org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlan::getMaxDays)
            .orElseThrow(() -> new RuntimeException("Plano associado não encontrado ou inativo"));
        Instant now = Instant.now();

        Map<UUID, StudentCommitment> latestPerSeries = buildLatestPerSeries(studentId, now);
        java.util.Set<Integer> activeWeekdays = new java.util.HashSet<>();
        for (StudentCommitment c : latestPerSeries.values()) {
            if (c.getCommitmentStatus() == CommitmentStatus.ATTENDING) {
                trainerScheduleRepository.findById(c.getSessionSeriesId())
                    .map(TrainerSchedule::getWeekday)
                    .ifPresent(activeWeekdays::add);
            }
        }
        for (UUID seriesId : sessionSeriesIds) {
            StudentCommitment current = latestPerSeries.get(seriesId);
            boolean alreadyAttending = current != null && current.getCommitmentStatus() == CommitmentStatus.ATTENDING;
            if (alreadyAttending) continue;
            int weekday = trainerScheduleRepository.findById(seriesId)
                .map(TrainerSchedule::getWeekday)
                .orElseThrow(() -> new RuntimeException("Trainer schedule not found"));
            if (!activeWeekdays.contains(weekday)) {
                activeWeekdays.add(weekday);
                if (activeWeekdays.size() > maxDays) {
                    throw new RuntimeException(String.format("Compromissos selecionados excedem o limite de %d dias do plano", maxDays));
                }
            }
        }
    }

    // Helper to build latest event per session series with tie-breaking on createdAt then id
    private Map<UUID, StudentCommitment> buildLatestPerSeries(UUID studentId, Instant timestamp) {
        List<StudentCommitment> all = studentCommitmentRepository.findByStudentId(studentId);
        // Sort ascending so later entries overwrite earlier ones. Order by effectiveFromTimestamp then createdAt then id
        return all.stream()
            .filter(c -> !c.getEffectiveFromTimestamp().isAfter(timestamp))
            .sorted(Comparator
                .comparing(StudentCommitment::getEffectiveFromTimestamp)
                .thenComparing(c -> c.getCreatedAt(), Comparator.nullsFirst(Comparator.naturalOrder()))
                .thenComparing(c -> c.getId().toString()))
            .collect(java.util.LinkedHashMap::new, (map, c) -> map.put(c.getSessionSeriesId(), c), Map::putAll);
    }

    public void resetScheduleIfExceedsPlan(UUID studentId, int allowedMaxDays) {
        Instant now = Instant.now();
        Map<UUID, StudentCommitment> latestPerSeries = buildLatestPerSeries(studentId, now);
        java.util.Set<Integer> activeWeekdays = new java.util.HashSet<>();

        for (StudentCommitment commitment : latestPerSeries.values()) {
            if (commitment.getCommitmentStatus() != CommitmentStatus.ATTENDING) {
                continue;
            }
            trainerScheduleRepository.findById(commitment.getSessionSeriesId())
                .map(TrainerSchedule::getWeekday)
                .ifPresent(activeWeekdays::add);
        }

        if (activeWeekdays.size() <= allowedMaxDays) {
            return;
        }

        latestPerSeries.values().stream()
            .filter(commitment -> commitment.getCommitmentStatus() == CommitmentStatus.ATTENDING)
            .forEach(commitment -> updateCommitment(studentId, commitment.getSessionSeriesId(), CommitmentStatus.NOT_ATTENDING));
    }
}

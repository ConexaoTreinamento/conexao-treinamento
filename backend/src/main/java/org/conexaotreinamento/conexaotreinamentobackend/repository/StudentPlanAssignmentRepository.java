package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlanAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface StudentPlanAssignmentRepository extends JpaRepository<StudentPlanAssignment, UUID> {
    
    @Query("SELECT spa FROM StudentPlanAssignment spa WHERE spa.studentId = :studentId AND spa.effectiveFromTimestamp <= :timestamp ORDER BY spa.effectiveFromTimestamp DESC")
    List<StudentPlanAssignment> findByStudentIdAndEffectiveFromTimestampBeforeOrderByEffectiveFromTimestampDesc(
        @Param("studentId") UUID studentId,
        @Param("timestamp") Instant timestamp
    );
    
    // Legacy queries for compatibility, update as needed
    // Find current active assignment (update to use Instant if needed)
    @Query("SELECT spa FROM StudentPlanAssignment spa WHERE spa.studentId = :studentId AND spa.effectiveFromTimestamp <= CURRENT_TIMESTAMP AND spa.effectiveToTimestamp >= CURRENT_TIMESTAMP")
    List<StudentPlanAssignment> findCurrentActiveAssignment(@Param("studentId") UUID studentId);
    
    // Find all assignments for a student (history)
    List<StudentPlanAssignment> findByStudentIdOrderByEffectiveFromTimestampDesc(UUID studentId);
    
    // Find assignments expiring soon
    @Query("SELECT spa FROM StudentPlanAssignment spa WHERE spa.effectiveToTimestamp BETWEEN CURRENT_TIMESTAMP AND :futureInstant ORDER BY spa.effectiveToTimestamp ASC")
    List<StudentPlanAssignment> findExpiringSoon(@Param("futureInstant") Instant futureInstant);
    
    // Find all currently active assignments
    @Query("SELECT spa FROM StudentPlanAssignment spa WHERE spa.effectiveFromTimestamp <= CURRENT_TIMESTAMP AND spa.effectiveToTimestamp >= CURRENT_TIMESTAMP")
    List<StudentPlanAssignment> findAllCurrentlyActive();
    
    // Find overlapping assignments (for validation)
    @Query("SELECT spa FROM StudentPlanAssignment spa WHERE spa.studentId = :studentId AND spa.effectiveFromTimestamp <= :endTimestamp AND spa.effectiveToTimestamp >= :startTimestamp")
    List<StudentPlanAssignment> findOverlappingAssignments(@Param("studentId") UUID studentId,
                                                          @Param("startTimestamp") Instant startTimestamp,
                                                          @Param("endTimestamp") Instant endTimestamp);
}

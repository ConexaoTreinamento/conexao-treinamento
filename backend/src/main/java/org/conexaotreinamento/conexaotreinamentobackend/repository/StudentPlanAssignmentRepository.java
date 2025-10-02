package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlanAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentPlanAssignmentRepository extends JpaRepository<StudentPlanAssignment, UUID> {
    
    // Find current active assignment for a student
    @Query("SELECT spa FROM StudentPlanAssignment spa WHERE spa.studentId = :studentId " +
           "AND CURRENT_DATE BETWEEN spa.startDate AND spa.endDate")
    Optional<StudentPlanAssignment> findCurrentActiveAssignment(@Param("studentId") UUID studentId);
    
    // Find all assignments for a student (history)
    @Query("SELECT spa FROM StudentPlanAssignment spa WHERE spa.studentId = :studentId " +
           "ORDER BY spa.startDate DESC")
    List<StudentPlanAssignment> findByStudentIdOrderByStartDateDesc(@Param("studentId") UUID studentId);
    
    // Find assignments expiring soon
    @Query("SELECT spa FROM StudentPlanAssignment spa WHERE spa.endDate BETWEEN CURRENT_DATE AND :futureDate " +
           "ORDER BY spa.endDate ASC")
    List<StudentPlanAssignment> findExpiringSoon(@Param("futureDate") LocalDate futureDate);
    
    // Find all currently active assignments
    @Query("SELECT spa FROM StudentPlanAssignment spa WHERE CURRENT_DATE BETWEEN spa.startDate AND spa.endDate")
    List<StudentPlanAssignment> findAllCurrentlyActive();
    
    // Find overlapping assignments (for validation)
    @Query("SELECT spa FROM StudentPlanAssignment spa WHERE spa.studentId = :studentId " +
           "AND ((spa.startDate <= :endDate AND spa.endDate >= :startDate))")
    List<StudentPlanAssignment> findOverlappingAssignments(@Param("studentId") UUID studentId,
                                                          @Param("startDate") LocalDate startDate,
                                                          @Param("endDate") LocalDate endDate);
}

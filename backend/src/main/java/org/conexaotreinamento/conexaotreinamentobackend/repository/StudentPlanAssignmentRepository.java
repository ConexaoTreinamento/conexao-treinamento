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
              @Query(value = """
                            SELECT * FROM student_plan_assignments spa
                            WHERE spa.student_id = :studentId
                                   AND spa.start_date <= CURRENT_DATE
                                   AND spa.start_date + spa.duration_days > CURRENT_DATE
                            ORDER BY spa.start_date DESC, spa.created_at DESC
                            LIMIT 1
                            """, nativeQuery = true)
              Optional<StudentPlanAssignment> findCurrentActiveAssignment(@Param("studentId") UUID studentId);
    
    // Find all assignments for a student (history)
    @Query("SELECT spa FROM StudentPlanAssignment spa WHERE spa.studentId = :studentId " +
           "ORDER BY spa.startDate DESC")
    List<StudentPlanAssignment> findByStudentIdOrderByStartDateDesc(@Param("studentId") UUID studentId);
    
    // Find assignments expiring soon
              @Query(value = """
                            SELECT * FROM student_plan_assignments spa
                            WHERE spa.start_date + spa.duration_days - 1 >= CURRENT_DATE
                                   AND spa.start_date + spa.duration_days - 1 <= :futureDate
                            ORDER BY spa.start_date + spa.duration_days - 1 ASC
                            """, nativeQuery = true)
              List<StudentPlanAssignment> findExpiringSoon(@Param("futureDate") LocalDate futureDate);
    
    // Find all currently active assignments
              @Query(value = """
                            SELECT * FROM student_plan_assignments spa
                            WHERE spa.start_date <= CURRENT_DATE
                                   AND spa.start_date + spa.duration_days > CURRENT_DATE
                            ORDER BY spa.start_date ASC
                            """, nativeQuery = true)
              List<StudentPlanAssignment> findAllCurrentlyActive();
    
    // Find overlapping assignments (for validation)
              @Query(value = """
                            SELECT * FROM student_plan_assignments spa
                            WHERE spa.student_id = :studentId
                                   AND spa.start_date < :endExclusive
                                   AND spa.start_date + spa.duration_days > :startDate
                            """, nativeQuery = true)
              List<StudentPlanAssignment> findOverlappingAssignments(@Param("studentId") UUID studentId,
                                                                                                                                                                                                           @Param("startDate") LocalDate startDate,
                                                                                                                                                                                                           @Param("endExclusive") LocalDate endExclusive);
}

package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlanHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentPlanHistoryRepository extends JpaRepository<StudentPlanHistory, UUID> {
    
    @Query("SELECT sph FROM StudentPlanHistory sph WHERE sph.studentId = :studentId ORDER BY sph.effectiveFromTimestamp DESC")
    List<StudentPlanHistory> findByStudentIdOrderByEffectiveFromDesc(@Param("studentId") UUID studentId);
    
    @Query("SELECT sph FROM StudentPlanHistory sph WHERE sph.studentId = :studentId " +
           "AND sph.effectiveFromTimestamp <= :timestamp " +
           "ORDER BY sph.effectiveFromTimestamp DESC LIMIT 1")
    Optional<StudentPlanHistory> findActiveAtTimestamp(@Param("studentId") UUID studentId, @Param("timestamp") Instant timestamp);
    
    @Query("SELECT sph FROM StudentPlanHistory sph WHERE sph.studentId = :studentId " +
           "AND sph.effectiveFromTimestamp <= CURRENT_TIMESTAMP " +
           "ORDER BY sph.effectiveFromTimestamp DESC LIMIT 1")
    Optional<StudentPlanHistory> findCurrentActive(@Param("studentId") UUID studentId);
}

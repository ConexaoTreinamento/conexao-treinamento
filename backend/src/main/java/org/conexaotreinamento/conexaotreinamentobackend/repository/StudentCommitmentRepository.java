package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentCommitment;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface StudentCommitmentRepository extends JpaRepository<StudentCommitment, UUID> {
    
    @Query("SELECT sc FROM StudentCommitment sc WHERE sc.studentId = :studentId AND sc.sessionSeriesId = :seriesId AND sc.effectiveFromTimestamp <= :timestamp AND (sc.effectiveToTimestamp IS NULL OR sc.effectiveToTimestamp > :timestamp) ORDER BY sc.effectiveFromTimestamp DESC")
    List<StudentCommitment> findByStudentIdAndSessionSeriesIdAndEffectiveFromTimestampBeforeOrderByEffectiveFromTimestampDesc(
        @Param("studentId") UUID studentId,
        @Param("seriesId") UUID seriesId,
        @Param("timestamp") Instant timestamp
    );
    
    @Query("SELECT COUNT(sc) FROM StudentCommitment sc WHERE sc.studentId = :studentId AND sc.effectiveFromTimestamp < :to AND (sc.effectiveToTimestamp IS NULL OR sc.effectiveToTimestamp > :from) AND sc.commitmentStatus != :status")
    long countByStudentIdAndEffectiveFromTimestampBetweenAndCommitmentStatusNot(
        @Param("studentId") UUID studentId,
        @Param("from") Instant from,
        @Param("to") Instant to,
        @Param("status") CommitmentStatus status
    );
}

package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentCommitment;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentCommitmentRepository extends JpaRepository<StudentCommitment, UUID> {
    
    List<StudentCommitment> findByStudentId(UUID studentId);
    
    List<StudentCommitment> findBySessionSeriesId(UUID sessionSeriesId);
    
    @Query("SELECT sc FROM StudentCommitment sc WHERE sc.studentId = :studentId AND sc.sessionSeriesId = :sessionSeriesId AND sc.effectiveFromTimestamp <= :timestamp ORDER BY sc.effectiveFromTimestamp DESC")
    List<StudentCommitment> findByStudentIdAndSessionSeriesIdAndEffectiveFromTimestampLessThanEqualOrderByEffectiveFromTimestampDesc(
        @Param("studentId") UUID studentId,
        @Param("sessionSeriesId") UUID sessionSeriesId,
        @Param("timestamp") Instant timestamp
    );
    
    @Query("SELECT sc FROM StudentCommitment sc WHERE sc.studentId = :studentId AND sc.commitmentStatus = :status AND sc.effectiveFromTimestamp <= :timestamp")
    List<StudentCommitment> findByStudentIdAndCommitmentStatusAndEffectiveFromTimestampLessThanEqual(
        @Param("studentId") UUID studentId,
        @Param("status") CommitmentStatus status,
        @Param("timestamp") Instant timestamp
    );
}

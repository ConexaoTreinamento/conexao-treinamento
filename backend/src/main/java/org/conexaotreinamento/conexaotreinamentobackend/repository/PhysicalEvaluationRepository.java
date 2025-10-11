package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PhysicalEvaluationRepository extends JpaRepository<PhysicalEvaluation, UUID> {
    List<PhysicalEvaluation> findByStudentIdAndDeletedAtIsNullOrderByDateDesc(UUID studentId);
    
    Optional<PhysicalEvaluation> findByIdAndDeletedAtIsNull(UUID id);
    
    boolean existsByIdAndStudentIdAndDeletedAtIsNull(UUID id, UUID studentId);
}


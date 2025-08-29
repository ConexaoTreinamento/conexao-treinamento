package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PhysicalImpairmentRepository extends JpaRepository<PhysicalImpairment, UUID> {
    List<PhysicalImpairment> findByStudentId(UUID studentId);
    void deleteByStudentId(UUID studentId);
}

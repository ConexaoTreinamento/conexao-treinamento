package org.conexaotreinamento.conexaotreinamentobackend.repository;

import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhysicalImpairmentRepository extends JpaRepository<PhysicalImpairment, UUID> {
    List<PhysicalImpairment> findByStudentId(UUID studentId);

    void deleteAllByStudentId(UUID studentId);
}

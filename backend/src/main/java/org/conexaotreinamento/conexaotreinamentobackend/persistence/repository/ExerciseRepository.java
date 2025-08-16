package org.conexaotreinamento.conexaotreinamentobackend.persistence.repository;

import org.conexaotreinamento.conexaotreinamentobackend.persistence.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {
    boolean existsByNameIgnoringCase(String name);
}

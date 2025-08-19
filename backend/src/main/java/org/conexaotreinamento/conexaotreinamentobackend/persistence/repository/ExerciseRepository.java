package org.conexaotreinamento.conexaotreinamentobackend.persistence.repository;

import org.conexaotreinamento.conexaotreinamentobackend.persistence.entity.Exercise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {
    boolean existsByNameIgnoringCaseAndDeletedAtIsNull(String name);
    
    Optional<Exercise> findByIdAndDeletedAtIsNull(UUID id);
    
    Page<Exercise> findByDeletedAtIsNull(Pageable pageable);
    
    @Query("SELECT e FROM Exercise e WHERE e.deletedAt IS NULL " +
           "AND (LOWER(e.name) LIKE :search " +
           "OR LOWER(e.description) LIKE :search)")
    Page<Exercise> findBySearchTermAndDeletedAtIsNull(@Param("search") String search, Pageable pageable);
}

package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Exercise;
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
           "AND (similarity(LOWER(e.name), :search) > 0.5 " +
           "OR similarity(LOWER(e.description), :search) > 0.5)")
    Page<Exercise> findBySearchTermAndDeletedAtIsNull(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT e FROM Exercise e WHERE " +
           "(similarity(LOWER(e.name), :search) > 0.5 " +
           "OR similarity(LOWER(e.description), :search) > 0.5)")
    Page<Exercise> findBySearchTermIncludingInactive(@Param("search") String search, Pageable pageable);
}
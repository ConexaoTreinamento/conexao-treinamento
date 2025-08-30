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
    
    @Query(value = "SELECT e.*, e.created_at as createdAt FROM exercises e WHERE e.deleted_at IS NULL " +
           "AND (word_similarity(unaccent(LOWER(e.name)), unaccent(LOWER(:search))) > 0.4 " +
           "OR word_similarity(unaccent(LOWER(e.description)), unaccent(LOWER(:search))) > 0.4)",
           nativeQuery = true)
    Page<Exercise> findBySearchTermAndDeletedAtIsNull(@Param("search") String search, Pageable pageable);
    
    @Query(value = "SELECT e.*, e.created_at as createdAt FROM exercises e WHERE " +
           "(word_similarity(unaccent(LOWER(e.name)), unaccent(LOWER(:search))) > 0.4 " +
           "OR word_similarity(unaccent(LOWER(e.description)), unaccent(LOWER(:search))) > 0.4)",
           nativeQuery = true)
    Page<Exercise> findBySearchTermIncludingInactive(@Param("search") String search, Pageable pageable);
}
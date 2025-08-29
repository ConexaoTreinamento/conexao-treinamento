package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
    boolean existsByEmailIgnoringCaseAndDeletedAtIsNull(String email);
    
    Optional<Student> findByIdAndDeletedAtIsNull(UUID id);
    
    Page<Student> findByDeletedAtIsNull(Pageable pageable);
    
    @Query("SELECT s FROM Student s WHERE s.deletedAt IS NULL " +
           "AND (LOWER(s.name) LIKE :search " +
           "OR LOWER(s.surname) LIKE :search " +
           "OR LOWER(s.email) LIKE :search " +
           "OR LOWER(s.phone) LIKE :search)")
    Page<Student> findBySearchTermAndDeletedAtIsNull(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT s FROM Student s WHERE " +
           "(LOWER(s.name) LIKE :search " +
           "OR LOWER(s.surname) LIKE :search " +
           "OR LOWER(s.email) LIKE :search " +
           "OR LOWER(s.phone) LIKE :search)")
    Page<Student> findBySearchTermIncludingInactive(@Param("search") String search, Pageable pageable);
}

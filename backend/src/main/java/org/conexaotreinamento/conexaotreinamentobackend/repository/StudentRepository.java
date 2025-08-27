package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
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
    
    @Query("SELECT s FROM Student s WHERE " +
           "(:includeInactive = true OR s.deletedAt IS NULL) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(s.name) LIKE :search OR " +
           "     LOWER(s.surname) LIKE :search OR " +
           "     LOWER(s.email) LIKE :search OR " +
           "     LOWER(s.phone) LIKE :search OR " +
           "     LOWER(s.profession) LIKE :search) " +
           "AND (:gender IS NULL OR s.gender = :gender) " +
           "AND (:profession IS NULL OR :profession = '' OR LOWER(s.profession) LIKE :profession) " +
           "AND (:minAge IS NULL OR YEAR(CURRENT_DATE) - YEAR(s.birthDate) >= :minAge) " +
           "AND (:maxAge IS NULL OR YEAR(CURRENT_DATE) - YEAR(s.birthDate) <= :maxAge) " +
           "AND (:joinedAfter IS NULL OR s.createdAt >= :joinedAfter) " +
           "AND (:joinedBefore IS NULL OR s.createdAt <= :joinedBefore)")
    Page<Student> findWithFilters(
            @Param("search") String search,
            @Param("gender") Student.Gender gender,
            @Param("profession") String profession,
            @Param("minAge") Integer minAge,
            @Param("maxAge") Integer maxAge,
            @Param("joinedAfter") Instant joinedAfter,
            @Param("joinedBefore") Instant joinedBefore,
            @Param("includeInactive") boolean includeInactive,
            Pageable pageable
    );
}

package org.conexaotreinamento.conexaotreinamentobackend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface StudentRepository extends JpaRepository<Student, UUID>, JpaSpecificationExecutor<Student> {
    boolean existsByEmailIgnoringCaseAndDeletedAtIsNull(String email);
    
    boolean existsByEmailIgnoringCaseAndDeletedAtIsNullAndIdNot(String email, UUID excludeId);
    
    Optional<Student> findByIdAndDeletedAtIsNull(UUID id);
    
    List<Student> findByDeletedAtIsNull();

    @Query("SELECT s.birthDate FROM Student s WHERE s.deletedAt IS NULL")
    List<LocalDate> findAllBirthDates();
}

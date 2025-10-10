package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID>, JpaSpecificationExecutor<Student> {
    boolean existsByEmailIgnoringCaseAndDeletedAtIsNull(String email);
    
    Optional<Student> findByIdAndDeletedAtIsNull(UUID id);
    
    List<Student> findByDeletedAtIsNull();

    @Query("SELECT s.birthDate FROM Student s WHERE s.deletedAt IS NULL")
    List<LocalDate> findAllBirthDates();
}

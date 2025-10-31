package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentPlanRepository extends JpaRepository<StudentPlan, UUID> {
    
    @Query("SELECT sp FROM StudentPlan sp WHERE sp.active = true ORDER BY sp.createdAt DESC")
    List<StudentPlan> findAllActive();
    
    @Query("SELECT sp FROM StudentPlan sp WHERE sp.active = true AND sp.name = :name")
    StudentPlan findActiveByName(@Param("name") String name);
    
    boolean existsByNameAndActiveTrue(String name);
    
    Optional<StudentPlan> findByIdAndActiveTrue(UUID id);
    Optional<StudentPlan> findByIdAndActiveFalse(UUID id);
    
    List<StudentPlan> findByActiveTrueOrderByNameAsc();

    List<StudentPlan> findByActiveFalseOrderByNameAsc();

    List<StudentPlan> findAllByOrderByNameAsc();
}

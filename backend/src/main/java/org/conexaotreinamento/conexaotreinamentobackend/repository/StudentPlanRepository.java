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
    
    @Query("SELECT sp FROM StudentPlan sp WHERE sp.isActive = true ORDER BY sp.createdAt DESC")
    List<StudentPlan> findAllIsActive();
    
    @Query("SELECT sp FROM StudentPlan sp WHERE sp.isActive = true AND sp.name = :name")
    StudentPlan findIsActiveByName(@Param("name") String name);
    
    boolean existsByName(String name);
    
    Optional<StudentPlan> findByIdAndIsActiveTrue(UUID id);
    Optional<StudentPlan> findByIdAndIsActiveFalse(UUID id);
    
    List<StudentPlan> findByIsActiveTrueOrderByNameAsc();

    List<StudentPlan> findByIsActiveFalseOrderByNameAsc();

    List<StudentPlan> findAllByOrderByNameAsc();
}

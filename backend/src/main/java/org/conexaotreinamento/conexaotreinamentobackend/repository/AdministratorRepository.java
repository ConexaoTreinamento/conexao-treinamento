package org.conexaotreinamento.conexaotreinamentobackend.repository;

import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdministratorRepository extends JpaRepository<Administrator, UUID> {
    boolean existsByEmailIgnoringCaseAndDeletedAtIsNull(String email);
    
    Optional<Administrator> findByIdAndDeletedAtIsNull(UUID id);
    
    Optional<Administrator> findByEmailIgnoringCaseAndDeletedAtIsNull(String email);
    
    Page<Administrator> findByDeletedAtIsNull(Pageable pageable);
    
    @Query("SELECT a FROM Administrator a WHERE a.deletedAt IS NULL " +
           "AND (LOWER(a.firstName) LIKE :search " +
           "OR LOWER(a.lastName) LIKE :search " +
           "OR LOWER(a.email) LIKE :search)")
    Page<Administrator> findBySearchTermAndDeletedAtIsNull(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT a FROM Administrator a WHERE " +
           "(LOWER(a.firstName) LIKE :search " +
           "OR LOWER(a.lastName) LIKE :search " +
           "OR LOWER(a.email) LIKE :search)")
    Page<Administrator> findBySearchTermIncludingInactive(@Param("search") String search, Pageable pageable);
}
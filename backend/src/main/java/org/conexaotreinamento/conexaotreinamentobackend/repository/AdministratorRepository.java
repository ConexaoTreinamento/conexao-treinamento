package org.conexaotreinamento.conexaotreinamentobackend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdministratorRepository extends JpaRepository<Administrator, UUID> {

    @Query("SELECT (COUNT(a) > 0)" +
            " FROM Administrator a INNER JOIN User u ON a.userId = u.id" +
            " WHERE LOWER(u.email) = LOWER(:email) AND u.deletedAt IS NULL")
    boolean existsByEmailIgnoreCase(String email);
    
    @Query("SELECT (COUNT(a) > 0)" +
            " FROM Administrator a INNER JOIN User u ON a.userId = u.id" +
            " WHERE LOWER(u.email) = LOWER(:email) AND a.userId != :excludeUserId AND u.deletedAt IS NULL")
    boolean existsByEmailIgnoreCaseAndUserIdNot(String email, UUID excludeUserId);

    @Query("SELECT new org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO(" +
            "a.id, a.firstName, a.lastName, u.email, " +
            "CONCAT(a.firstName, ' ', a.lastName), (u.deletedAt IS NULL), u.createdAt) " +
            " FROM Administrator a INNER JOIN User u ON a.userId = u.id" +
            " WHERE a.id = :id AND u.deletedAt IS NULL")
    Optional<AdministratorListItemResponseDTO> findActiveAdministratorProfileById(UUID id);

    @Query("SELECT new org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO(" +
            "a.id, a.firstName, a.lastName, u.email, " +
            "CONCAT(a.firstName, ' ', a.lastName), (u.deletedAt IS NULL), u.createdAt) " +
            " FROM Administrator a INNER JOIN User u ON a.userId = u.id" +
            " WHERE a.userId = :user_id AND u.deletedAt IS NULL")
    Optional<AdministratorListItemResponseDTO> findActiveAdministratorByUserId(UUID user_id);

    @Query("SELECT new org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO(" +
            "a.id, a.firstName, a.lastName, u.email, " +
            "CONCAT(a.firstName, ' ', a.lastName), (u.deletedAt IS NULL), u.createdAt) " +
            " FROM Administrator a INNER JOIN User u ON a.userId = u.id" +
            " WHERE (:includeInactive = true OR u.deletedAt IS NULL)")
    List<AdministratorListItemResponseDTO> findAllAdministratorProfiles(Boolean includeInactive);

    @Query("SELECT new org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO(" +
            "a.id, a.firstName, a.lastName, u.email, " +
            "CONCAT(a.firstName, ' ', a.lastName), (u.deletedAt IS NULL), u.createdAt) " +
            " FROM Administrator a INNER JOIN User u ON a.userId = u.id" +
            " WHERE u.deletedAt IS NULL " +
            " AND (LOWER(a.firstName) LIKE :search " +
            " OR LOWER(a.lastName) LIKE :search " +
            " OR LOWER(u.email) LIKE :search)")
    List<AdministratorListItemResponseDTO> findBySearchTermAndActive(@Param("search") String search);

    @Query("SELECT new org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO(" +
            "a.id, a.firstName, a.lastName, u.email, " +
            "CONCAT(a.firstName, ' ', a.lastName), (u.deletedAt IS NULL), u.createdAt) " +
            " FROM Administrator a INNER JOIN User u ON a.userId = u.id" +
            " WHERE (LOWER(a.firstName) LIKE :search " +
            " OR LOWER(a.lastName) LIKE :search " +
            " OR LOWER(u.email) LIKE :search)")
    List<AdministratorListItemResponseDTO> findBySearchTermIncludingInactive(@Param("search") String search);

    @Query("SELECT new org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO(" +
            "a.id, a.firstName, a.lastName, u.email, " +
            "CONCAT(a.firstName, ' ', a.lastName), (u.deletedAt IS NULL), u.createdAt) " +
            " FROM Administrator a INNER JOIN User u ON a.userId = u.id" +
            " WHERE u.deletedAt IS NULL")
    Page<AdministratorListItemResponseDTO> findActiveAdministratorsPage(Pageable pageable);

    @Query("SELECT new org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO(" +
            "a.id, a.firstName, a.lastName, u.email, " +
            "CONCAT(a.firstName, ' ', a.lastName), (u.deletedAt IS NULL), u.createdAt) " +
            " FROM Administrator a INNER JOIN User u ON a.userId = u.id")
    Page<AdministratorListItemResponseDTO> findAllAdministratorsPage(Pageable pageable);
}
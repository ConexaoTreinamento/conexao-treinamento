package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ListTrainersDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TrainerRepository extends JpaRepository<Trainer, UUID> {

    @Query(" SELECT (COUNT(t) > 0)" +
            " FROM Trainer t INNER JOIN User u ON t.userId = u.id" +
            " WHERE u.deletedAt IS NULL AND LOWER(u.email) = LOWER(:email)")
    boolean existsByEmailIgnoreCaseAndDeletedAtIsNull(String email);

    @Query("SELECT new org.conexaotreinamento.conexaotreinamentobackend.dto.response.ListTrainersDTO(" +
            "t.id, t.name, u.email, t.phone, t.address, t.birthDate, t.specialties, t.compensationType, (u.deletedAt IS NULL), u.createdAt, 120) " +
            " FROM Trainer t INNER JOIN User u ON t.userId = u.id" +
            " WHERE t.id = :id AND u.deletedAt IS NULL")
    Optional<ListTrainersDTO> findActiveTrainerProfileById(UUID id);


    @Query("SELECT new org.conexaotreinamento.conexaotreinamentobackend.dto.response.ListTrainersDTO(" +
            "t.id, t.name, u.email, t.phone, t.address, t.birthDate, t.specialties, t.compensationType, (u.deletedAt IS NULL), u.createdAt, 120) " +
            " FROM Trainer t INNER JOIN User u ON t.userId = u.id" +
            " WHERE (:includeInactive = true OR u.deletedAt IS NULL)")
    List<ListTrainersDTO> findAllTrainerProfiles(Boolean includeInactive);

}

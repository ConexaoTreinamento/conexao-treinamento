package org.conexaotreinamento.conexaotreinamentobackend.persistence.repository;

import org.conexaotreinamento.conexaotreinamentobackend.api.dto.response.TrainerResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.persistence.entity.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TrainerRepository extends JpaRepository<Trainer, UUID> {

    boolean existsByEmailIgnoreCaseAndDeletedAtIsNull(String email);
    
    Optional<Trainer> findByIdAndDeletedAtIsNull(UUID id);


    @Query("SELECT new org.conexaotreinamento.conexaotreinamentobackend.api.dto.response.TrainerResponseDTO(" +
            "t.id, t.name, t.email, t.phone, t.specialties, t.compensationType, t.createdAt, t.updatedAt, (t.deletedAt IS NULL)) " +
            "FROM Trainer t WHERE t.deletedAt IS NULL")
    List<TrainerResponseDTO> findAllParsed();

}

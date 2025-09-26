package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.ParticipantExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ParticipantExerciseRepository extends JpaRepository<ParticipantExercise, UUID> {
    List<ParticipantExercise> findBySessionParticipant_IdAndActiveTrue(UUID sessionParticipantId);
}

package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.ParticipantExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ParticipantExerciseRepository extends JpaRepository<ParticipantExercise, UUID> {
    List<ParticipantExercise> findBySessionParticipant_IdAndActiveTrue(UUID sessionParticipantId);

    @Query("select pe from ParticipantExercise pe left join fetch pe.exercise e where pe.sessionParticipant.id = :sessionParticipantId and pe.active = true")
    List<ParticipantExercise> findActiveWithExerciseBySessionParticipantId(@Param("sessionParticipantId") UUID sessionParticipantId);
}

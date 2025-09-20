package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.SessionParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SessionParticipantRepository extends JpaRepository<SessionParticipant, UUID> {
    
    List<SessionParticipant> findByScheduledSession_IdAndActiveTrue(UUID scheduledSessionId);
    
    List<SessionParticipant> findByStudentIdAndActiveTrue(UUID studentId);
}

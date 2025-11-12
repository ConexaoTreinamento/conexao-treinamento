package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.SessionParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SessionParticipantRepository extends JpaRepository<SessionParticipant, UUID> {
    
    List<SessionParticipant> findByScheduledSession_IdAndIsActiveTrue(UUID scheduledSessionId);
    
    List<SessionParticipant> findByStudentIdAndIsActiveTrue(UUID studentId);
    
    List<SessionParticipant> findByScheduledSession_IdAndStudentIdAndIsActiveTrue(UUID scheduledSessionId, UUID studentId);
}

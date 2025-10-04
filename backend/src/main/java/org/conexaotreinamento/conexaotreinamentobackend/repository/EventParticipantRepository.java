package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.EventParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EventParticipantRepository extends JpaRepository<EventParticipant, UUID> {
    Optional<EventParticipant> findByEventIdAndStudentId(UUID eventId, UUID studentId);
    boolean existsByEventIdAndStudentId(UUID eventId, UUID studentId);
    void deleteByEventIdAndStudentId(UUID eventId, UUID studentId);
}

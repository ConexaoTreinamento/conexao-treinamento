package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.EventParticipant;

import java.time.Instant;
import java.util.UUID;

public record EventParticipantResponseDTO(
        UUID id,
        String name,
        String avatar, // Will be null for now
        Instant enrolledAt,
        Boolean present
) {
    public static EventParticipantResponseDTO fromEntity(EventParticipant participant) {
        if (participant == null || participant.getStudent() == null) return null;

        String fullName = participant.getStudent().getName() + " " + participant.getStudent().getSurname();

        return new EventParticipantResponseDTO(
                participant.getStudent().getId(),
                fullName,
                null, // Avatar not implemented yet
                participant.getEnrolledAt(),
                participant.getPresent()
        );
    }
}

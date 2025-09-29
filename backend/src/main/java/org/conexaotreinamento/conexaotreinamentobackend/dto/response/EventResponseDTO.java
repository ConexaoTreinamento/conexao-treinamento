package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;
import org.conexaotreinamento.conexaotreinamentobackend.enums.EventStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public record EventResponseDTO(
        UUID id,
        String name,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String location,
        String description,
        UUID instructorId,
        String instructor,
        String status,
        List<EventParticipantResponseDTO> participants,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt
) {
    public static EventResponseDTO fromEntity(Event e) {
        if (e == null) return null;

        List<EventParticipantResponseDTO> participantDTOs = e.getParticipants() != null ?
                e.getParticipants().stream()
                        .map(EventParticipantResponseDTO::fromEntity)
                        .collect(Collectors.toList()) :
                List.of();

        String instructorName = null;
        UUID instructorId = null;
        if (e.getTrainer() != null) {
            instructorName = e.getTrainer().getName();
            instructorId = e.getTrainer().getId();
        }

        return new EventResponseDTO(
                e.getId(),
                e.getName(),
                e.getDate(),
                e.getStartTime(),
                e.getEndTime(),
                e.getLocation(),
                e.getDescription(),
                instructorId,
                instructorName,
                e.getStatus() != null ? e.getStatus().getDisplayName() : EventStatus.OPEN.name(),
                participantDTOs,
                e.getCreatedAt(),
                e.getUpdatedAt(),
                e.getDeletedAt()
        );
    }
}

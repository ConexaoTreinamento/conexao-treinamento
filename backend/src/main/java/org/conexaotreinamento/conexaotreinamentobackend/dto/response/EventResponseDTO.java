package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record EventResponseDTO(
        UUID id,
        String name,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String location,
        String description,
        String instructor,
        List<String> participants,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt
) {
    public static EventResponseDTO fromEntity(Event e) {
        if (e == null) return null;
        return new EventResponseDTO(
                e.getId(),
                e.getName(),
                e.getDate(),
                e.getStartTime(),
                e.getEndTime(),
                e.getLocation(),
                e.getDescription(),
                e.getInstructor(),
                e.getParticipants(),
                e.getCreatedAt(),
                e.getUpdatedAt(),
                e.getDeletedAt()
        );
    }
}

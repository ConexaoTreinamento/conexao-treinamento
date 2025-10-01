package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record PatchEventRequestDTO(
        String name,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        @Size(max = 255) String location,
        String description,
        UUID trainerId,
        List<UUID> participantIds
) {}

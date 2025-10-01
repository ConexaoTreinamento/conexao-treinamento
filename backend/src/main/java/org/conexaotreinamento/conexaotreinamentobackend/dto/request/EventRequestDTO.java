package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record EventRequestDTO(
        @NotBlank @Size(max = 200) String name,
        @NotNull LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        @Size(max = 255) String location,
        String description,
        @NotNull UUID trainerId,
        List<UUID> participantIds
) {}

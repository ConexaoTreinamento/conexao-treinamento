package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record EventRequestDTO(
        @NotBlank @Size(max = 200) String name,
        @NotNull LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        @Size(max = 255) String location,
        String description,
        @Size(max = 120) String instructor,
        List<String> participants
) {}

package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import jakarta.validation.constraints.Size;

public record UpdateEventRequestDTO(
        @Size(max = 200) String name,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        @Size(max = 255) String location,
        String description,
        @Size(max = 120) String instructor,
        List<String> participants
) {}

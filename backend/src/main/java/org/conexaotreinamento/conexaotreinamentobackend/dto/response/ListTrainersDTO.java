package org.conexaotreinamento.conexaotreinamentobackend.dto.response;


import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ListTrainersDTO(
        UUID id,
        String name,
        String email,
        String phone,
        String address,
        LocalDate birthDate,
        List<String> specialties,
        CompensationType compensationType,
        Boolean active,
        Instant joinDate,
        Integer hoursWorked
){}

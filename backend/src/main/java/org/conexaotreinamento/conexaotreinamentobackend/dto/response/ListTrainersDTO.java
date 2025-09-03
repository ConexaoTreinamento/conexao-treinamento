package org.conexaotreinamento.conexaotreinamentobackend.dto.response;


import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;

import java.util.List;
import java.util.UUID;

public record ListTrainersDTO(
        UUID id,
        String name,
        String email,
        String phone,
        List<String> specialties,
        CompensationType compensationType,
        Boolean active
){}
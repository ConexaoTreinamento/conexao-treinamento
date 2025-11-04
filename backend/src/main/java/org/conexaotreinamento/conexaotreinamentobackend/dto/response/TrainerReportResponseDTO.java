package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;

import java.util.List;
import java.util.UUID;

public record TrainerReportResponseDTO(
        UUID id,
        String name,
        Double hoursWorked,
        Integer classesGiven,
        Integer studentsManaged,
        CompensationType compensation,
        List<String> specialties
) {}


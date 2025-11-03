package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import java.util.List;

public record ReportsResponseDTO(
        List<TrainerReportResponseDTO> trainerReports,
        List<AgeDistributionResponseDTO> ageDistribution
) {}


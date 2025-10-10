package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import java.util.List;

public record ReportsResponseDTO(
        List<TrainerReportDTO> trainerReports,
        List<AgeDistributionDTO> ageDistribution
) {}


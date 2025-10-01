package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommitmentDetailResponseDTO {
    private UUID id;
    private UUID studentId;
    private String studentName;
    private UUID sessionSeriesId;
    private String seriesName;
    private CommitmentStatus commitmentStatus;
    private Instant effectiveFromTimestamp;
    private Instant createdAt;
}

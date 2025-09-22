package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommitmentRequestDTO {
    
    @NotNull(message = "Session series ID is required")
    private UUID sessionSeriesId;
    
    @NotNull(message = "Commitment status is required")
    private CommitmentStatus commitmentStatus;
    
    @NotNull(message = "Effective from timestamp is required")
    private Instant effectiveFromTimestamp;
    
    private Instant effectiveToTimestamp;
}

package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkCommitmentRequestDTO {
    
    @NotEmpty(message = "Session series IDs cannot be empty")
    private List<UUID> sessionSeriesIds;
    
    @NotNull(message = "Commitment status is required")
    private CommitmentStatus commitmentStatus;
    
    // Optional: Allow setting effective timestamp for retroactive changes
    private Instant effectiveFromTimestamp;
}

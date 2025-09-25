package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentCommitmentRequestDTO {
    
    @NotNull(message = "Commitment status is required")
    private CommitmentStatus commitmentStatus;
    
    // Optional: Allow setting effective timestamp for retroactive changes
    private Instant effectiveFromTimestamp;
}

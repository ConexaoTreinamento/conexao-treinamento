package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignPlanRequestDTO {
    
    @NotNull(message = "Plan ID is required")
    private UUID planId;
    
    private Instant effectiveFromTimestamp;
    
    // If not provided, defaults to current timestamp
    public Instant getEffectiveFromTimestamp() {
        return effectiveFromTimestamp != null ? effectiveFromTimestamp : Instant.now();
    }
}

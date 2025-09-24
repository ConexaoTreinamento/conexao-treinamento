package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduledSessionRequestDTO {
    
    private UUID sessionSeriesId; // Null for one-off
    
    private UUID trainerId;
    
    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalDateTime endTime;
    
    private Integer maxParticipants = 10;
    
    private String seriesName;
    
    private String notes;
    
    private String room;
    
    private String equipment;
    
    private boolean instanceOverride = true;
    
    @NotNull(message = "Effective from timestamp is required")
    private Instant effectiveFromTimestamp;
    
    private Boolean retroactive = false;

    /**
     * Optional compact JSON diff that explicitly lists overridden fields for an instance.
     * - Example: {"trainerId": null, "room":"Studio A", "maxParticipants": 12}
     * This allows callers to explicitly clear inherited values by sending nulls.
     */
    private String diff;
}

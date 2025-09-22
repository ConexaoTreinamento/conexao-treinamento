package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainerScheduleRequestDTO {
    
    @NotNull(message = "Trainer ID is required")
    private UUID trainerId;
    
    @NotNull(message = "Weekday is required")
    private Integer weekday;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    private Integer intervalDuration = 60;
    
    @NotNull(message = "Series name is required")
    private String seriesName;
    
    @NotNull(message = "Effective from timestamp is required")
    private Instant effectiveFromTimestamp;
    
    private Instant effectiveToTimestamp;
}

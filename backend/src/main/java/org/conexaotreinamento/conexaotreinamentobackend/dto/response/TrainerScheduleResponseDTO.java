package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainerScheduleResponseDTO {
    private UUID id;
    private UUID trainerId;
    private String trainerName;
    private Integer weekday;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer intervalDuration;
    private String seriesName;
    private Instant effectiveFromTimestamp;
    private Instant effectiveToTimestamp;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}

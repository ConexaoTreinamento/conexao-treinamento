package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OneOffSessionCreateRequestDTO {
    private String seriesName; // label
    private UUID trainerId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer maxParticipants;
    private String notes;
}

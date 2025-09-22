package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduledSessionResponseDTO {
    private UUID id;
    private UUID sessionSeriesId;
    private String sessionId;
    private UUID trainerId;
    private String trainerName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer maxParticipants;
    private String seriesName;
    private String notes;
    private String room;
    private String equipment;
    private boolean instanceOverride;
    private Instant effectiveFromTimestamp;
    private List<SessionParticipantResponseDTO> participants;
}

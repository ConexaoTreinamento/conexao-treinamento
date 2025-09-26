package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponseDTO {
    private String sessionId;
    private UUID trainerId;
    private String trainerName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String seriesName;
    private String notes;
    private boolean instanceOverride;
    private List<StudentCommitmentResponseDTO> students;
    private boolean canceled;
    private Integer maxParticipants;
    private Integer presentCount;
}

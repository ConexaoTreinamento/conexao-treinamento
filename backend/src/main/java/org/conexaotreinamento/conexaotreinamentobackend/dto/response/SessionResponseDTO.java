package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("isInstanceOverride")
    private boolean isInstanceOverride;
    private List<StudentCommitmentResponseDTO> students;
    @JsonProperty("isCanceled")
    private boolean isCanceled;
    private Integer presentCount;
}

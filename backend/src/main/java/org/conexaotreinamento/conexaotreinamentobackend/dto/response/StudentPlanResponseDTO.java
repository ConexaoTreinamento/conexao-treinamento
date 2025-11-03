package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentPlanResponseDTO {
    private UUID id;
    private String name;
    private Integer maxDays;
    private Integer durationDays;
    private String description;
    @JsonProperty("isActive")
    private Boolean isActive;
    private Instant createdAt;
}

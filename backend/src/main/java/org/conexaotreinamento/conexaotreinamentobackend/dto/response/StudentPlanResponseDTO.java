package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import com.fasterxml.jackson.annotation.JsonGetter;
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
    private Boolean isActive;
    private Instant createdAt;
    
    // Explicit getter to ensure proper JSON serialization
    @JsonGetter("isActive")
    public Boolean getIsActive() {
        return isActive;
    }
}

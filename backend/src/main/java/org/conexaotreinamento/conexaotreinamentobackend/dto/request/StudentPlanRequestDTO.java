package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentPlanRequestDTO {
    
    @NotBlank(message = "Plan name is required")
    private String name;
    
    @NotNull(message = "Max days is required")
    @Positive(message = "Max days must be positive")
    private Integer maxDays;
    
    
    @NotNull(message = "Duration days is required")
    @Positive(message = "Duration days must be positive")
    private Integer durationDays;
    
    private String description;
}

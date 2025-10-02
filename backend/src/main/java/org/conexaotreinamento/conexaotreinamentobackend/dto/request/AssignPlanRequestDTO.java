package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignPlanRequestDTO {
    
    @NotNull(message = "Plan ID is required")
    private UUID planId;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    private String assignmentNotes;
}

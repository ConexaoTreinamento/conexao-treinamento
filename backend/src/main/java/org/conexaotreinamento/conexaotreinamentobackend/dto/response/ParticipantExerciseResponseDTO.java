package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantExerciseResponseDTO {
    private UUID id;
    private UUID exerciseId;
    private String exerciseName;
    private Integer setsAssigned;
    private Integer setsCompleted;
    private Integer repsAssigned;
    private Integer repsCompleted;
    private boolean isComplete;
}

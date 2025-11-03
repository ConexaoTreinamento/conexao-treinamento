package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantExerciseCreateRequestDTO {
    private UUID exerciseId;
    private Integer setsCompleted;
    private Integer repsCompleted;
    private Double weightCompleted;
    private String exerciseNotes;
    private Boolean isDone;
}

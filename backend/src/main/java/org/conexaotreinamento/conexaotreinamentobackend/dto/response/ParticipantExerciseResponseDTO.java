package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantExerciseResponseDTO {
    private UUID id;              // participant exercise record id
    private UUID exerciseId;      // referenced exercise id
    private String exerciseName;  // convenience name (from Exercise)
    private Integer setsCompleted;
    private Integer repsCompleted;
    private Double weightCompleted;
    private String exerciseNotes;
    private Boolean done;
}

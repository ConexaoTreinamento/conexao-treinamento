package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantExerciseUpdateRequestDTO {
    private Integer setsCompleted;
    private Integer repsCompleted;
    private Double weightCompleted;
    private String exerciseNotes;
    @JsonProperty("isDone")
    private Boolean isDone;
}

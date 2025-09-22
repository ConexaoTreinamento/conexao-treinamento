package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionParticipantResponseDTO {
    private UUID id;
    private UUID studentId;
    private String studentName;
    private ParticipationType participationType;
    private boolean isPresent;
    private String attendanceNotes;
    private List<ParticipantExerciseResponseDTO> exercises;
    
    public enum ParticipationType {
        INCLUDED, EXCLUDED
    }
}

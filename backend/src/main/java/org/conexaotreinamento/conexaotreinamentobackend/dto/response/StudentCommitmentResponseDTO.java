package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentCommitmentResponseDTO {
    private UUID studentId;
    private String studentName;
    private CommitmentStatus commitmentStatus;
    private List<ExerciseResponseDTO> exercises;
    // Detailed participant exercise records (with performance data) for this session instance
    private List<ParticipantExerciseResponseDTO> participantExercises;
    // Attendance info for this specific session instance, if materialized
    private Boolean present;
    private String attendanceNotes;
}

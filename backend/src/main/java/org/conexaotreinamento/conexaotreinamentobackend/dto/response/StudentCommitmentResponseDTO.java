package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;

import java.util.List;
import java.util.UUID;

public record StudentCommitmentResponseDTO(
        UUID studentId,
        String studentName,
        CommitmentStatus commitmentStatus,
        List<ExerciseResponseDTO> exercises,
        List<ParticipantExerciseResponseDTO> participantExercises,
        Boolean present,
        String attendanceNotes
) {}

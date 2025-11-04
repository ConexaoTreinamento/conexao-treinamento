package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import java.util.UUID;

public record ParticipantExerciseResponseDTO(
        UUID id,
        UUID exerciseId,
        String exerciseName,
        Integer setsCompleted,
        Integer repsCompleted,
        Double weightCompleted,
        String exerciseNotes,
        Boolean done
) {}

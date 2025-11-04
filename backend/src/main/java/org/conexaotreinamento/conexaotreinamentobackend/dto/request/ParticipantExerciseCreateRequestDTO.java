package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import java.util.UUID;

public record ParticipantExerciseCreateRequestDTO(
        UUID exerciseId,
        Integer setsCompleted,
        Integer repsCompleted,
        Double weightCompleted,
        String exerciseNotes,
        Boolean done
) {}

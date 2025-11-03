package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

public record ParticipantExerciseUpdateRequestDTO(
        Integer setsCompleted,
        Integer repsCompleted,
        Double weightCompleted,
        String exerciseNotes,
        Boolean done
) {}

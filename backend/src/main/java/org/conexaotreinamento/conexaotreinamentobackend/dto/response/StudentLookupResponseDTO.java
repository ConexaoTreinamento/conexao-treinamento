package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;

import java.util.UUID;

public record StudentLookupResponseDTO(
        UUID id,
        String name
) {
    public static StudentLookupResponseDTO fromEntity(Student student) {
        if (student == null) return null;
        return new StudentLookupResponseDTO(
                student.getId(),
                student.getName() + " " + student.getSurname()
        );
    }
}

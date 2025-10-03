package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;

import java.util.UUID;

public record StudentLookupDTO(
        UUID id,
        String name
) {
    public static StudentLookupDTO fromEntity(Student student) {
        if (student == null) return null;
        return new StudentLookupDTO(
                student.getId(),
                student.getName() + " " + student.getSurname()
        );
    }
}

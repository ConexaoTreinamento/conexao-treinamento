package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record StudentResponseDTO(
        UUID id,
        String email,
        String name,
        String surname,
        Student.Gender gender,
        LocalDate birthDate,
        String phone,
        String profession,
        String street,
        String number,
        String complement,
        String neighborhood,
        String cep,
        String emergencyContactName,
        String emergencyContactPhone,
        String emergencyContactRelationship,
        String objectives,
        String observations,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt,
        AnamnesisResponseDTO anamnesis,
        List<PhysicalImpairmentResponseDTO> physicalImpairments
) {
    public static StudentResponseDTO fromEntity(Student student) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}

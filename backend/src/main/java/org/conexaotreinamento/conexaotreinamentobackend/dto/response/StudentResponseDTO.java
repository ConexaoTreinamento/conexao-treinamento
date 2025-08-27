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
        return new StudentResponseDTO(
                student.getId(),
                student.getEmail(),
                student.getName(),
                student.getSurname(),
                student.getGender(),
                student.getBirthDate(),
                student.getPhone(),
                student.getProfession(),
                student.getStreet(),
                student.getNumber(),
                student.getComplement(),
                student.getNeighborhood(),
                student.getCep(),
                student.getEmergencyContactName(),
                student.getEmergencyContactPhone(),
                student.getEmergencyContactRelationship(),
                student.getObjectives(),
                null, // observations - not implemented in entity yet
                student.getCreatedAt(),
                student.getUpdatedAt(),
                student.getDeletedAt(),
                null, // anamnesis - will be loaded separately if needed
                List.of() // physicalImpairments - will be loaded separately if needed
        );
    }
}

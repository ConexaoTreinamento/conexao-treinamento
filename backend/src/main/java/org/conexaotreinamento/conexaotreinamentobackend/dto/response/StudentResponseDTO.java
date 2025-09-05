package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment;
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
        LocalDate registrationDate,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt,
        AnamnesisResponseDTO anamnesis,
        List<PhysicalImpairmentResponseDTO> physicalImpairments
) {
    public static PhysicalImpairmentResponseDTO fromEntity(PhysicalImpairment physicalImpairment) {
        return new PhysicalImpairmentResponseDTO(
                physicalImpairment.getId(),
                physicalImpairment.getImpairmentType(),
                physicalImpairment.getName(),
                physicalImpairment.getObservations()
        );
    }
    public static StudentResponseDTO fromEntity(Student savedStudent, AnamnesisResponseDTO responseAnamnesis, List<PhysicalImpairmentResponseDTO> responsePhysicalImpairments) {
        return new StudentResponseDTO(
                savedStudent.getId(),
                savedStudent.getEmail(),
                savedStudent.getName(),
                savedStudent.getSurname(),
                savedStudent.getGender(),
                savedStudent.getBirthDate(),
                savedStudent.getPhone(),
                savedStudent.getProfession(),
                savedStudent.getStreet(),
                savedStudent.getNumber(),
                savedStudent.getComplement(),
                savedStudent.getNeighborhood(),
                savedStudent.getCep(),
                savedStudent.getEmergencyContactName(),
                savedStudent.getEmergencyContactPhone(),
                savedStudent.getEmergencyContactRelationship(),
                savedStudent.getObjectives(),
                savedStudent.getObservations(),
                savedStudent.getCreatedAt(),
                savedStudent.getUpdatedAt(),
                savedStudent.getDeletedAt(),
                responseAnamnesis,
                responsePhysicalImpairments
        );
    }
}

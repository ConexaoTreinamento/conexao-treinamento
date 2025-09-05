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
    public static StudentResponseDTO fromEntity(Student salvedStudent, AnamnesisResponseDTO responseAnamnesis, List<PhysicalImpairmentResponseDTO> responsePhysicalImpairments) {
        return new StudentResponseDTO(
                salvedStudent.getId(),
                salvedStudent.getEmail(),
                salvedStudent.getName(),
                salvedStudent.getSurname(),
                salvedStudent.getGender(),
                salvedStudent.getBirthDate(),
                salvedStudent.getPhone(),
                salvedStudent.getProfession(),
                salvedStudent.getStreet(),
                salvedStudent.getNumber(),
                salvedStudent.getComplement(),
                salvedStudent.getNeighborhood(),
                salvedStudent.getCep(),
                salvedStudent.getEmergencyContactName(),
                salvedStudent.getEmergencyContactPhone(),
                salvedStudent.getEmergencyContactRelationship(),
                salvedStudent.getObjectives(),
                salvedStudent.getObservations(),
                salvedStudent.getCreatedAt(),
                salvedStudent.getUpdatedAt(),
                salvedStudent.getDeletedAt(),
                responseAnamnesis,
                responsePhysicalImpairments
        );
    }
}

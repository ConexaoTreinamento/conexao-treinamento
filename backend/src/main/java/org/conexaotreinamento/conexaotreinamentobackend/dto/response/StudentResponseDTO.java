package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import lombok.*;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponseDTO {
    private UUID id;
    private String email;
    private String name;
    private String surname;
    private Student.Gender gender;
    private LocalDate birthDate;
    private String phone;
    private String profession;
    private String street;
    private String number;
    private String complement;
    private String neighborhood;
    private String cep;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;
    private String objectives;
    private String observations;
    private LocalDate registrationDate;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;
    private AnamnesisResponseDTO anamnesis;
    private List<PhysicalImpairmentResponseDTO> physicalImpairments;
    private StudentPlanAssignmentResponseDTO activePlan;
    
    public static StudentResponseDTO fromEntity(Student student, StudentPlanAssignmentResponseDTO activePlan) {
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
                student.getObservations(),
                student.getRegistrationDate(),
                student.getCreatedAt(),
                student.getUpdatedAt(),
                student.getDeletedAt(),
                null, // anamnesis will be provided separately when available
                List.of(), // physicalImpairments will be provided separately when available
                activePlan
        );
    }
}

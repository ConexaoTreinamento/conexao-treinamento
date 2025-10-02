package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;

import java.time.LocalDate;
import java.util.List;

public record StudentRequestDTO(
        @NotBlank @Email String email,
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 100) String surname,
        @NotNull Student.Gender gender,
        @NotNull @Past LocalDate birthDate,
        @Size(max = 20) String phone,
        @Size(max = 100) String profession,
        @Size(max = 255) String street,
        @Size(max = 10) String number,
        @Size(max = 100) String complement,
        @Size(max = 100) String neighborhood,
        @Size(max = 10) String cep,
        @Size(max = 100) String emergencyContactName,
        @Size(max = 20) String emergencyContactPhone,
        @Size(max = 50) String emergencyContactRelationship,
        String objectives,
        String observations,
        @Valid AnamnesisRequestDTO anamnesis,
        @Valid List<PhysicalImpairmentRequestDTO> physicalImpairments
) {}

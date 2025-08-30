package org.conexaotreinamento.conexaotreinamentobackend.dto;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateTrainerDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.entity.enums.CompensationType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("CreateTrainerDTO Tests")
class CreateTrainerDTOTest {

    @Test
    @DisplayName("Should create DTO with all fields")
    void shouldCreateDTOWithAllFields() {
        // Given
        String name = "João Silva";
        String email = "joao@test.com";
        String phone = "+5511999999999";
        String password = "password123";
        List<String> specialties = List.of("Musculação", "Crossfit");
        CompensationType compensationType = CompensationType.HOURLY;

        // When
        CreateTrainerDTO dto = new CreateTrainerDTO(name, email, phone, password, specialties, compensationType);

        // Then
        assertThat(dto.name()).isEqualTo(name);
        assertThat(dto.email()).isEqualTo(email);
        assertThat(dto.phone()).isEqualTo(phone);
        assertThat(dto.password()).isEqualTo(password);
        assertThat(dto.specialties()).isEqualTo(specialties);
        assertThat(dto.compensationType()).isEqualTo(compensationType);
    }

    @Test
    @DisplayName("Should create DTO with null values")
    void shouldCreateDTOWithNullValues() {
        // When
        CreateTrainerDTO dto = new CreateTrainerDTO(null, null, null, null, null, null);

        // Then
        assertThat(dto.name()).isNull();
        assertThat(dto.email()).isNull();
        assertThat(dto.phone()).isNull();
        assertThat(dto.password()).isNull();
        assertThat(dto.specialties()).isNull();
        assertThat(dto.compensationType()).isNull();
    }

    @Test
    @DisplayName("Should convert DTO to entity correctly")
    void shouldConvertDTOToEntityCorrectly() {
        // Given
        UUID userId = UUID.randomUUID();
        CreateTrainerDTO dto = new CreateTrainerDTO(
            "Maria Santos",
            "maria@test.com",
            "+5511888888888",
            "password456",
            List.of("Yoga", "Pilates"),
            CompensationType.MONTHLY
        );

        // When
        Trainer trainer = dto.toEntity(userId);

        // Then
        assertThat(trainer.getId()).isEqualTo(userId);
        assertThat(trainer.getName()).isEqualTo("Maria Santos");
        assertThat(trainer.getEmail()).isEqualTo("maria@test.com");
        assertThat(trainer.getPhone()).isEqualTo("+5511888888888");
        assertThat(trainer.getSpecialties()).containsExactlyInAnyOrder("Yoga", "Pilates");
        assertThat(trainer.getCompensationType()).isEqualTo(CompensationType.MONTHLY);
    }

    @Test
    @DisplayName("Should convert DTO with empty specialties to entity")
    void shouldConvertDTOWithEmptySpecialtiesToEntity() {
        // Given
        UUID userId = UUID.randomUUID();
        CreateTrainerDTO dto = new CreateTrainerDTO(
            "Trainer Name",
            "trainer@test.com",
            "+5511777777777",
            "password",
            List.of(),
            CompensationType.HOURLY
        );

        // When
        Trainer trainer = dto.toEntity(userId);

        // Then
        assertThat(trainer.getId()).isEqualTo(userId);
        assertThat(trainer.getSpecialties()).isEmpty();
    }

    @Test
    @DisplayName("Should convert DTO with single specialty to entity")
    void shouldConvertDTOWithSingleSpecialtyToEntity() {
        // Given
        UUID userId = UUID.randomUUID();
        CreateTrainerDTO dto = new CreateTrainerDTO(
            "Single Specialist",
            "single@test.com",
            "+5511666666666",
            "password",
            List.of("Natação"),
            CompensationType.MONTHLY
        );

        // When
        Trainer trainer = dto.toEntity(userId);

        // Then
        assertThat(trainer.getId()).isEqualTo(userId);
        assertThat(trainer.getSpecialties()).hasSize(1);
        assertThat(trainer.getSpecialties()).contains("Natação");
    }

    @Test
    @DisplayName("Should convert DTO with multiple specialties to entity")
    void shouldConvertDTOWithMultipleSpecialtiesToEntity() {
        // Given
        UUID userId = UUID.randomUUID();
        List<String> specialties = List.of("Musculação", "Crossfit", "Yoga", "Pilates", "Natação");
        CreateTrainerDTO dto = new CreateTrainerDTO(
            "Multi Specialist",
            "multi@test.com",
            "+5511555555555",
            "password",
            specialties,
            CompensationType.HOURLY
        );

        // When
        Trainer trainer = dto.toEntity(userId);

        // Then
        assertThat(trainer.getId()).isEqualTo(userId);
        assertThat(trainer.getSpecialties()).hasSize(5);
        assertThat(trainer.getSpecialties()).containsExactlyInAnyOrderElementsOf(specialties);
    }

    @Test
    @DisplayName("Should handle both compensation types correctly")
    void shouldHandleBothCompensationTypesCorrectly() {
        // Given
        UUID userId = UUID.randomUUID();

        // Test HOURLY
        CreateTrainerDTO hourlyDTO = new CreateTrainerDTO(
            "Hourly Trainer",
            "hourly@test.com",
            "+5511444444444",
            "password",
            List.of("Personal Training"),
            CompensationType.HOURLY
        );

        // Test MONTHLY
        CreateTrainerDTO monthlyDTO = new CreateTrainerDTO(
            "Monthly Trainer",
            "monthly@test.com",
            "+5511333333333",
            "password",
            List.of("Group Classes"),
            CompensationType.MONTHLY
        );

        // When
        Trainer hourlyTrainer = hourlyDTO.toEntity(userId);
        Trainer monthlyTrainer = monthlyDTO.toEntity(UUID.randomUUID());

        // Then
        assertThat(hourlyTrainer.getCompensationType()).isEqualTo(CompensationType.HOURLY);
        assertThat(monthlyTrainer.getCompensationType()).isEqualTo(CompensationType.MONTHLY);
    }

    @Test
    @DisplayName("Should preserve all field values when converting to entity")
    void shouldPreserveAllFieldValuesWhenConvertingToEntity() {
        // Given
        UUID userId = UUID.randomUUID();
        String name = "Test Trainer";
        String email = "test@example.com";
        String phone = "+5511123456789";
        String password = "securePassword123";
        List<String> specialties = List.of("Specialty1", "Specialty2");
        CompensationType compensationType = CompensationType.HOURLY;

        CreateTrainerDTO dto = new CreateTrainerDTO(name, email, phone, password, specialties, compensationType);

        // When
        Trainer trainer = dto.toEntity(userId);

        // Then
        assertThat(trainer.getId()).isEqualTo(userId);
        assertThat(trainer.getName()).isEqualTo(name);
        assertThat(trainer.getEmail()).isEqualTo(email);
        assertThat(trainer.getPhone()).isEqualTo(phone);
        assertThat(trainer.getSpecialties()).isEqualTo(specialties);
        assertThat(trainer.getCompensationType()).isEqualTo(compensationType);
    }

    @Test
    @DisplayName("Should create entity with different user IDs")
    void shouldCreateEntityWithDifferentUserIds() {
        // Given
        UUID userId1 = UUID.randomUUID();
        UUID userId2 = UUID.randomUUID();
        CreateTrainerDTO dto = new CreateTrainerDTO(
            "Same Trainer",
            "same@test.com",
            "+5511111111111",
            "password",
            List.of("Same Specialty"),
            CompensationType.HOURLY
        );

        // When
        Trainer trainer1 = dto.toEntity(userId1);
        Trainer trainer2 = dto.toEntity(userId2);

        // Then
        assertThat(trainer1.getId()).isEqualTo(userId1);
        assertThat(trainer2.getId()).isEqualTo(userId2);
        assertThat(trainer1.getId()).isNotEqualTo(trainer2.getId());
        
        // Other fields should be the same
        assertThat(trainer1.getName()).isEqualTo(trainer2.getName());
        assertThat(trainer1.getEmail()).isEqualTo(trainer2.getEmail());
        assertThat(trainer1.getPhone()).isEqualTo(trainer2.getPhone());
        assertThat(trainer1.getSpecialties()).isEqualTo(trainer2.getSpecialties());
        assertThat(trainer1.getCompensationType()).isEqualTo(trainer2.getCompensationType());
    }
}

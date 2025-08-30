package org.conexaotreinamento.conexaotreinamentobackend.dto;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.entity.enums.CompensationType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("TrainerResponseDTO Tests")
class TrainerResponseDTOTest {

    @Test
    @DisplayName("Should create DTO with all fields")
    void shouldCreateDTOWithAllFields() {
        // Given
        UUID id = UUID.randomUUID();
        String name = "João Silva";
        String email = "joao@test.com";
        String phone = "+5511999999999";
        List<String> specialties = List.of("Musculação", "Crossfit");
        CompensationType compensationType = CompensationType.HOURLY;

        // When
        TrainerResponseDTO dto = new TrainerResponseDTO(id, name, email, phone, specialties, compensationType);

        // Then
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.name()).isEqualTo(name);
        assertThat(dto.email()).isEqualTo(email);
        assertThat(dto.phone()).isEqualTo(phone);
        assertThat(dto.specialties()).isEqualTo(specialties);
        assertThat(dto.compensationType()).isEqualTo(compensationType);
    }

    @Test
    @DisplayName("Should create DTO with null values")
    void shouldCreateDTOWithNullValues() {
        // When
        TrainerResponseDTO dto = new TrainerResponseDTO(null, null, null, null, null, null);

        // Then
        assertThat(dto.id()).isNull();
        assertThat(dto.name()).isNull();
        assertThat(dto.email()).isNull();
        assertThat(dto.phone()).isNull();
        assertThat(dto.specialties()).isNull();
        assertThat(dto.compensationType()).isNull();
    }

    @Test
    @DisplayName("Should create DTO from entity correctly")
    void shouldCreateDTOFromEntityCorrectly() {
        // Given
        UUID id = UUID.randomUUID();
        Trainer trainer = new Trainer();
        trainer.setId(id);
        trainer.setName("Maria Santos");
        trainer.setEmail("maria@test.com");
        trainer.setPhone("+5511888888888");
        trainer.setSpecialties(List.of("Yoga", "Pilates"));
        trainer.setCompensationType(CompensationType.MONTHLY);

        // When
        TrainerResponseDTO dto = TrainerResponseDTO.fromEntity(trainer);

        // Then
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.name()).isEqualTo("Maria Santos");
        assertThat(dto.email()).isEqualTo("maria@test.com");
        assertThat(dto.phone()).isEqualTo("+5511888888888");
        assertThat(dto.specialties()).containsExactlyInAnyOrder("Yoga", "Pilates");
        assertThat(dto.compensationType()).isEqualTo(CompensationType.MONTHLY);
    }

    @Test
    @DisplayName("Should create DTO from entity with empty specialties")
    void shouldCreateDTOFromEntityWithEmptySpecialties() {
        // Given
        UUID id = UUID.randomUUID();
        Trainer trainer = new Trainer();
        trainer.setId(id);
        trainer.setName("Trainer Name");
        trainer.setEmail("trainer@test.com");
        trainer.setPhone("+5511777777777");
        trainer.setSpecialties(List.of());
        trainer.setCompensationType(CompensationType.HOURLY);

        // When
        TrainerResponseDTO dto = TrainerResponseDTO.fromEntity(trainer);

        // Then
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.specialties()).isEmpty();
        assertThat(dto.compensationType()).isEqualTo(CompensationType.HOURLY);
    }

    @Test
    @DisplayName("Should create DTO from entity with single specialty")
    void shouldCreateDTOFromEntityWithSingleSpecialty() {
        // Given
        UUID id = UUID.randomUUID();
        Trainer trainer = new Trainer();
        trainer.setId(id);
        trainer.setName("Single Specialist");
        trainer.setEmail("single@test.com");
        trainer.setPhone("+5511666666666");
        trainer.setSpecialties(List.of("Natação"));
        trainer.setCompensationType(CompensationType.MONTHLY);

        // When
        TrainerResponseDTO dto = TrainerResponseDTO.fromEntity(trainer);

        // Then
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.specialties()).hasSize(1);
        assertThat(dto.specialties()).contains("Natação");
    }

    @Test
    @DisplayName("Should create DTO from entity with multiple specialties")
    void shouldCreateDTOFromEntityWithMultipleSpecialties() {
        // Given
        UUID id = UUID.randomUUID();
        List<String> specialties = List.of("Musculação", "Crossfit", "Yoga", "Pilates", "Natação");
        Trainer trainer = new Trainer();
        trainer.setId(id);
        trainer.setName("Multi Specialist");
        trainer.setEmail("multi@test.com");
        trainer.setPhone("+5511555555555");
        trainer.setSpecialties(specialties);
        trainer.setCompensationType(CompensationType.HOURLY);

        // When
        TrainerResponseDTO dto = TrainerResponseDTO.fromEntity(trainer);

        // Then
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.specialties()).hasSize(5);
        assertThat(dto.specialties()).containsExactlyInAnyOrderElementsOf(specialties);
    }

    @Test
    @DisplayName("Should handle both compensation types correctly")
    void shouldHandleBothCompensationTypesCorrectly() {
        // Given
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();

        Trainer hourlyTrainer = new Trainer();
        hourlyTrainer.setId(id1);
        hourlyTrainer.setName("Hourly Trainer");
        hourlyTrainer.setEmail("hourly@test.com");
        hourlyTrainer.setPhone("+5511444444444");
        hourlyTrainer.setSpecialties(List.of("Personal Training"));
        hourlyTrainer.setCompensationType(CompensationType.HOURLY);

        Trainer monthlyTrainer = new Trainer();
        monthlyTrainer.setId(id2);
        monthlyTrainer.setName("Monthly Trainer");
        monthlyTrainer.setEmail("monthly@test.com");
        monthlyTrainer.setPhone("+5511333333333");
        monthlyTrainer.setSpecialties(List.of("Group Classes"));
        monthlyTrainer.setCompensationType(CompensationType.MONTHLY);

        // When
        TrainerResponseDTO hourlyDTO = TrainerResponseDTO.fromEntity(hourlyTrainer);
        TrainerResponseDTO monthlyDTO = TrainerResponseDTO.fromEntity(monthlyTrainer);

        // Then
        assertThat(hourlyDTO.compensationType()).isEqualTo(CompensationType.HOURLY);
        assertThat(monthlyDTO.compensationType()).isEqualTo(CompensationType.MONTHLY);
    }

    @Test
    @DisplayName("Should preserve all field values when creating from entity")
    void shouldPreserveAllFieldValuesWhenCreatingFromEntity() {
        // Given
        UUID id = UUID.randomUUID();
        String name = "Test Trainer";
        String email = "test@example.com";
        String phone = "+5511123456789";
        List<String> specialties = List.of("Specialty1", "Specialty2");
        CompensationType compensationType = CompensationType.HOURLY;

        Trainer trainer = new Trainer();
        trainer.setId(id);
        trainer.setName(name);
        trainer.setEmail(email);
        trainer.setPhone(phone);
        trainer.setSpecialties(specialties);
        trainer.setCompensationType(compensationType);

        // When
        TrainerResponseDTO dto = TrainerResponseDTO.fromEntity(trainer);

        // Then
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.name()).isEqualTo(name);
        assertThat(dto.email()).isEqualTo(email);
        assertThat(dto.phone()).isEqualTo(phone);
        assertThat(dto.specialties()).isEqualTo(specialties);
        assertThat(dto.compensationType()).isEqualTo(compensationType);
    }

    @Test
    @DisplayName("Should create different DTOs from different entities")
    void shouldCreateDifferentDTOsFromDifferentEntities() {
        // Given
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();

        Trainer trainer1 = new Trainer();
        trainer1.setId(id1);
        trainer1.setName("Trainer One");
        trainer1.setEmail("one@test.com");
        trainer1.setPhone("+5511111111111");
        trainer1.setSpecialties(List.of("Specialty One"));
        trainer1.setCompensationType(CompensationType.HOURLY);

        Trainer trainer2 = new Trainer();
        trainer2.setId(id2);
        trainer2.setName("Trainer Two");
        trainer2.setEmail("two@test.com");
        trainer2.setPhone("+5511222222222");
        trainer2.setSpecialties(List.of("Specialty Two"));
        trainer2.setCompensationType(CompensationType.MONTHLY);

        // When
        TrainerResponseDTO dto1 = TrainerResponseDTO.fromEntity(trainer1);
        TrainerResponseDTO dto2 = TrainerResponseDTO.fromEntity(trainer2);

        // Then
        assertThat(dto1.id()).isEqualTo(id1);
        assertThat(dto2.id()).isEqualTo(id2);
        assertThat(dto1.id()).isNotEqualTo(dto2.id());
        
        assertThat(dto1.name()).isEqualTo("Trainer One");
        assertThat(dto2.name()).isEqualTo("Trainer Two");
        
        assertThat(dto1.compensationType()).isEqualTo(CompensationType.HOURLY);
        assertThat(dto2.compensationType()).isEqualTo(CompensationType.MONTHLY);
    }

    @Test
    @DisplayName("Should handle null specialties list from entity")
    void shouldHandleNullSpecialtiesListFromEntity() {
        // Given
        UUID id = UUID.randomUUID();
        Trainer trainer = new Trainer();
        trainer.setId(id);
        trainer.setName("Trainer Name");
        trainer.setEmail("trainer@test.com");
        trainer.setPhone("+5511777777777");
        trainer.setSpecialties(null);
        trainer.setCompensationType(CompensationType.HOURLY);

        // When
        TrainerResponseDTO dto = TrainerResponseDTO.fromEntity(trainer);

        // Then
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.specialties()).isNull();
    }
}

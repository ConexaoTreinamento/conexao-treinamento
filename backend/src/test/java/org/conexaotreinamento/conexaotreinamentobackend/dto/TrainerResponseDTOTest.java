package org.conexaotreinamento.conexaotreinamentobackend.dto;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
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
        String address = "Rua das Flores, 123";
        LocalDate birthDate = LocalDate.of(1990, 5, 15);
        List<String> specialties = List.of("Musculação", "Crossfit");
        CompensationType compensationType = CompensationType.HOURLY;
        Instant joinDate = Instant.now();
        Integer hoursWorked = 120;

        // When
        TrainerResponseDTO dto = new TrainerResponseDTO(id, name, email, phone, address, birthDate, specialties, compensationType, joinDate, hoursWorked);

        // Then
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.name()).isEqualTo(name);
        assertThat(dto.email()).isEqualTo(email);
        assertThat(dto.phone()).isEqualTo(phone);
        assertThat(dto.address()).isEqualTo(address);
        assertThat(dto.birthDate()).isEqualTo(birthDate);
        assertThat(dto.specialties()).isEqualTo(specialties);
        assertThat(dto.compensationType()).isEqualTo(compensationType);
        assertThat(dto.joinDate()).isEqualTo(joinDate);
        assertThat(dto.hoursWorked()).isEqualTo(hoursWorked);
    }

    @Test
    @DisplayName("Should create DTO with null values")
    void shouldCreateDTOWithNullValues() {
        // When
        TrainerResponseDTO dto = new TrainerResponseDTO(null, null, null, null, null, null, null, null, null, null);

        // Then
        assertThat(dto.id()).isNull();
        assertThat(dto.name()).isNull();
        assertThat(dto.email()).isNull();
        assertThat(dto.phone()).isNull();
        assertThat(dto.address()).isNull();
        assertThat(dto.birthDate()).isNull();
        assertThat(dto.specialties()).isNull();
        assertThat(dto.compensationType()).isNull();
        assertThat(dto.joinDate()).isNull();
        assertThat(dto.hoursWorked()).isNull();
    }

    @Test
    @DisplayName("Should create DTO from entity correctly")
    void shouldCreateDTOFromEntityCorrectly() {
        // Given
        UUID trainerId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String email = "maria@test.com";
        Instant joinDate = Instant.now();
        
        Trainer trainer = new Trainer();
        trainer.setId(trainerId);
        trainer.setUserId(userId);
        trainer.setName("Maria Santos");
        trainer.setPhone("+5511888888888");
        trainer.setAddress("Rua das Palmeiras, 456");
        trainer.setBirthDate(LocalDate.of(1985, 3, 20));
        trainer.setSpecialties(List.of("Yoga", "Pilates"));
        trainer.setCompensationType(CompensationType.MONTHLY);

        // When
        TrainerResponseDTO dto = TrainerResponseDTO.fromEntity(trainer, email, joinDate);

        // Then
        assertThat(dto.id()).isEqualTo(trainerId);
        assertThat(dto.name()).isEqualTo("Maria Santos");
        assertThat(dto.email()).isEqualTo("maria@test.com");
        assertThat(dto.phone()).isEqualTo("+5511888888888");
        assertThat(dto.address()).isEqualTo("Rua das Palmeiras, 456");
        assertThat(dto.birthDate()).isEqualTo(LocalDate.of(1985, 3, 20));
        assertThat(dto.specialties()).containsExactlyInAnyOrder("Yoga", "Pilates");
        assertThat(dto.compensationType()).isEqualTo(CompensationType.MONTHLY);
        assertThat(dto.joinDate()).isEqualTo(joinDate);
        assertThat(dto.hoursWorked()).isEqualTo(120);
    }

    @Test
    @DisplayName("Should create DTO from entity with empty specialties")
    void shouldCreateDTOFromEntityWithEmptySpecialties() {
        // Given
        UUID trainerId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String email = "trainer@test.com";
        Instant joinDate = Instant.now();
        
        Trainer trainer = new Trainer();
        trainer.setId(trainerId);
        trainer.setUserId(userId);
        trainer.setName("Trainer Name");
        trainer.setPhone("+5511777777777");
        trainer.setAddress("Rua Central, 789");
        trainer.setBirthDate(LocalDate.of(1992, 8, 10));
        trainer.setSpecialties(List.of());
        trainer.setCompensationType(CompensationType.HOURLY);

        // When
        TrainerResponseDTO dto = TrainerResponseDTO.fromEntity(trainer, email, joinDate);

        // Then
        assertThat(dto.id()).isEqualTo(trainerId);
        assertThat(dto.specialties()).isEmpty();
        assertThat(dto.compensationType()).isEqualTo(CompensationType.HOURLY);
        assertThat(dto.address()).isEqualTo("Rua Central, 789");
        assertThat(dto.birthDate()).isEqualTo(LocalDate.of(1992, 8, 10));
        assertThat(dto.hoursWorked()).isEqualTo(120);
    }

    @Test
    @DisplayName("Should create DTO from entity with single specialty")
    void shouldCreateDTOFromEntityWithSingleSpecialty() {
        // Given
        UUID trainerId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String email = "single@test.com";
        Instant joinDate = Instant.now();
        
        Trainer trainer = new Trainer();
        trainer.setId(trainerId);
        trainer.setUserId(userId);
        trainer.setName("Single Specialist");
        trainer.setPhone("+5511666666666");
        trainer.setAddress("Av. Principal, 100");
        trainer.setBirthDate(LocalDate.of(1988, 12, 5));
        trainer.setSpecialties(List.of("Natação"));
        trainer.setCompensationType(CompensationType.MONTHLY);

        // When
        TrainerResponseDTO dto = TrainerResponseDTO.fromEntity(trainer, email, joinDate);

        // Then
        assertThat(dto.id()).isEqualTo(trainerId);
        assertThat(dto.specialties()).hasSize(1);
        assertThat(dto.specialties()).contains("Natação");
        assertThat(dto.address()).isEqualTo("Av. Principal, 100");
        assertThat(dto.birthDate()).isEqualTo(LocalDate.of(1988, 12, 5));
    }

    @Test
    @DisplayName("Should create DTO from entity with multiple specialties")
    void shouldCreateDTOFromEntityWithMultipleSpecialties() {
        // Given
        UUID trainerId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String email = "multi@test.com";
        Instant joinDate = Instant.now();
        List<String> specialties = List.of("Musculação", "Crossfit", "Yoga", "Pilates", "Natação");
        
        Trainer trainer = new Trainer();
        trainer.setId(trainerId);
        trainer.setUserId(userId);
        trainer.setName("Multi Specialist");
        trainer.setPhone("+5511555555555");
        trainer.setAddress("Rua dos Esportes, 200");
        trainer.setBirthDate(LocalDate.of(1987, 6, 25));
        trainer.setSpecialties(specialties);
        trainer.setCompensationType(CompensationType.HOURLY);

        // When
        TrainerResponseDTO dto = TrainerResponseDTO.fromEntity(trainer, email, joinDate);

        // Then
        assertThat(dto.id()).isEqualTo(trainerId);
        assertThat(dto.specialties()).hasSize(5);
        assertThat(dto.specialties()).containsExactlyInAnyOrderElementsOf(specialties);
        assertThat(dto.address()).isEqualTo("Rua dos Esportes, 200");
        assertThat(dto.birthDate()).isEqualTo(LocalDate.of(1987, 6, 25));
    }

    @Test
    @DisplayName("Should handle both compensation types correctly")
    void shouldHandleBothCompensationTypesCorrectly() {
        // Given
        UUID trainerId1 = UUID.randomUUID();
        UUID trainerId2 = UUID.randomUUID();
        UUID userId1 = UUID.randomUUID();
        UUID userId2 = UUID.randomUUID();
        String email1 = "hourly@test.com";
        String email2 = "monthly@test.com";
        Instant joinDate1 = Instant.now();
        Instant joinDate2 = Instant.now();

        Trainer hourlyTrainer = new Trainer();
        hourlyTrainer.setId(trainerId1);
        hourlyTrainer.setUserId(userId1);
        hourlyTrainer.setName("Hourly Trainer");
        hourlyTrainer.setPhone("+5511444444444");
        hourlyTrainer.setAddress("Rua Horista, 300");
        hourlyTrainer.setBirthDate(LocalDate.of(1990, 1, 15));
        hourlyTrainer.setSpecialties(List.of("Personal Training"));
        hourlyTrainer.setCompensationType(CompensationType.HOURLY);

        Trainer monthlyTrainer = new Trainer();
        monthlyTrainer.setId(trainerId2);
        monthlyTrainer.setUserId(userId2);
        monthlyTrainer.setName("Monthly Trainer");
        monthlyTrainer.setPhone("+5511333333333");
        monthlyTrainer.setAddress("Rua Mensal, 400");
        monthlyTrainer.setBirthDate(LocalDate.of(1989, 11, 30));
        monthlyTrainer.setSpecialties(List.of("Group Classes"));
        monthlyTrainer.setCompensationType(CompensationType.MONTHLY);

        // When
        TrainerResponseDTO hourlyDTO = TrainerResponseDTO.fromEntity(hourlyTrainer, email1, joinDate1);
        TrainerResponseDTO monthlyDTO = TrainerResponseDTO.fromEntity(monthlyTrainer, email2, joinDate2);

        // Then
        assertThat(hourlyDTO.compensationType()).isEqualTo(CompensationType.HOURLY);
        assertThat(monthlyDTO.compensationType()).isEqualTo(CompensationType.MONTHLY);
        assertThat(hourlyDTO.address()).isEqualTo("Rua Horista, 300");
        assertThat(monthlyDTO.address()).isEqualTo("Rua Mensal, 400");
    }

    @Test
    @DisplayName("Should preserve all field values when creating from entity")
    void shouldPreserveAllFieldValuesWhenCreatingFromEntity() {
        // Given
        UUID trainerId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String name = "Test Trainer";
        String email = "test@example.com";
        String phone = "+5511123456789";
        String address = "Rua de Teste, 500";
        LocalDate birthDate = LocalDate.of(1991, 4, 18);
        List<String> specialties = List.of("Specialty1", "Specialty2");
        CompensationType compensationType = CompensationType.HOURLY;
        Instant joinDate = Instant.now();

        Trainer trainer = new Trainer();
        trainer.setId(trainerId);
        trainer.setUserId(userId);
        trainer.setName(name);
        trainer.setPhone(phone);
        trainer.setAddress(address);
        trainer.setBirthDate(birthDate);
        trainer.setSpecialties(specialties);
        trainer.setCompensationType(compensationType);

        // When
        TrainerResponseDTO dto = TrainerResponseDTO.fromEntity(trainer, email, joinDate);

        // Then
        assertThat(dto.id()).isEqualTo(trainerId);
        assertThat(dto.name()).isEqualTo(name);
        assertThat(dto.email()).isEqualTo(email);
        assertThat(dto.phone()).isEqualTo(phone);
        assertThat(dto.address()).isEqualTo(address);
        assertThat(dto.birthDate()).isEqualTo(birthDate);
        assertThat(dto.specialties()).isEqualTo(specialties);
        assertThat(dto.compensationType()).isEqualTo(compensationType);
        assertThat(dto.joinDate()).isEqualTo(joinDate);
        assertThat(dto.hoursWorked()).isEqualTo(120);
    }

    @Test
    @DisplayName("Should handle null specialties list from entity")
    void shouldHandleNullSpecialtiesListFromEntity() {
        // Given
        UUID trainerId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String email = "trainer@test.com";
        Instant joinDate = Instant.now();
        
        Trainer trainer = new Trainer();
        trainer.setId(trainerId);
        trainer.setUserId(userId);
        trainer.setName("Trainer Name");
        trainer.setPhone("+5511777777777");
        trainer.setAddress("Rua Nula, 600");
        trainer.setBirthDate(LocalDate.of(1993, 9, 12));
        trainer.setSpecialties(null);
        trainer.setCompensationType(CompensationType.HOURLY);

        // When
        TrainerResponseDTO dto = TrainerResponseDTO.fromEntity(trainer, email, joinDate);

        // Then
        assertThat(dto.id()).isEqualTo(trainerId);
        assertThat(dto.specialties()).isNull();
        assertThat(dto.address()).isEqualTo("Rua Nula, 600");
        assertThat(dto.birthDate()).isEqualTo(LocalDate.of(1993, 9, 12));
        assertThat(dto.hoursWorked()).isEqualTo(120);
    }

    @Test
    @DisplayName("Should always return 120 as hoursWorked")
    void shouldAlwaysReturn120AsHoursWorked() {
        // Given
        UUID trainerId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String email = "hours@test.com";
        Instant joinDate = Instant.now();
        
        Trainer trainer = new Trainer();
        trainer.setId(trainerId);
        trainer.setUserId(userId);
        trainer.setName("Hours Trainer");
        trainer.setPhone("+5511999999999");
        trainer.setAddress("Rua das Horas, 700");
        trainer.setBirthDate(LocalDate.of(1986, 2, 28));
        trainer.setSpecialties(List.of("Testing"));
        trainer.setCompensationType(CompensationType.MONTHLY);

        // When
        TrainerResponseDTO dto = TrainerResponseDTO.fromEntity(trainer, email, joinDate);

        // Then
        assertThat(dto.hoursWorked()).isEqualTo(120);
    }
}

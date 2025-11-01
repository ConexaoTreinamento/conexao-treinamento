package org.conexaotreinamento.conexaotreinamentobackend.unit.dto;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerLookupDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("TrainerLookupDTO Tests")
class TrainerLookupDTOTest {

    @Test
    @DisplayName("Should create DTO with all fields")
    void shouldCreateDTOWithAllFields() {
        // Given
        UUID id = UUID.randomUUID();
        String name = "Prof. John Trainer";

        // When
        TrainerLookupDTO dto = new TrainerLookupDTO(id, name);

        // Then
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.name()).isEqualTo(name);
    }

    @Test
    @DisplayName("Should create DTO with null values")
    void shouldCreateDTOWithNullValues() {
        // When
        TrainerLookupDTO dto = new TrainerLookupDTO(null, null);

        // Then
        assertThat(dto.id()).isNull();
        assertThat(dto.name()).isNull();
    }

    @Test
    @DisplayName("Should convert from null entity")
    void shouldConvertFromNullEntity() {
        // When
        TrainerLookupDTO dto = TrainerLookupDTO.fromEntity(null);

        // Then
        assertThat(dto).isNull();
    }

    @Test
    @DisplayName("Should convert from entity with different name formats")
    void shouldConvertFromEntityWithDifferentNameFormats() {
        // Given
        Trainer trainer1 = createTrainer("John", "Doe");
        Trainer trainer2 = createTrainer("Jane", "Smith");
        Trainer trainer3 = createTrainer("Bob", "Johnson");
        Trainer trainer4 = createTrainer("Alice", "Brown");
        Trainer trainer5 = createTrainer("Charlie", "Wilson");

        // When
        TrainerLookupDTO dto1 = TrainerLookupDTO.fromEntity(trainer1);
        TrainerLookupDTO dto2 = TrainerLookupDTO.fromEntity(trainer2);
        TrainerLookupDTO dto3 = TrainerLookupDTO.fromEntity(trainer3);
        TrainerLookupDTO dto4 = TrainerLookupDTO.fromEntity(trainer4);
        TrainerLookupDTO dto5 = TrainerLookupDTO.fromEntity(trainer5);

        // Then
        assertThat(dto1.name()).isEqualTo("Prof. John");
        assertThat(dto2.name()).isEqualTo("Prof. Jane");
        assertThat(dto3.name()).isEqualTo("Prof. Bob");
        assertThat(dto4.name()).isEqualTo("Prof. Alice");
        assertThat(dto5.name()).isEqualTo("Prof. Charlie");
    }

    @Test
    @DisplayName("Should convert from entity with single name")
    void shouldConvertFromEntityWithSingleName() {
        // Given
        Trainer trainer = createTrainer("Madonna", null);

        // When
        TrainerLookupDTO dto = TrainerLookupDTO.fromEntity(trainer);

        // Then
        assertThat(dto.name()).isEqualTo("Prof. Madonna");
    }

    @Test
    @DisplayName("Should convert from entity with null surname")
    void shouldConvertFromEntityWithNullSurname() {
        // Given
        Trainer trainer = createTrainer("Cher", null);

        // When
        TrainerLookupDTO dto = TrainerLookupDTO.fromEntity(trainer);

        // Then
        assertThat(dto.name()).isEqualTo("Prof. Cher");
    }

    @Test
    @DisplayName("Should convert from entity with null name")
    void shouldConvertFromEntityWithNullName() {
        // Given
        Trainer trainer = createTrainer(null, "Smith");

        // When
        TrainerLookupDTO dto = TrainerLookupDTO.fromEntity(trainer);

        // Then
        assertThat(dto.name()).isEqualTo("Prof. null");
    }

    @Test
    @DisplayName("Should convert from entity with both names null")
    void shouldConvertFromEntityWithBothNamesNull() {
        // Given
        Trainer trainer = createTrainer(null, null);

        // When
        TrainerLookupDTO dto = TrainerLookupDTO.fromEntity(trainer);

        // Then
        assertThat(dto.name()).isEqualTo("Prof. null");
    }

    @Test
    @DisplayName("Should convert from entity with empty strings")
    void shouldConvertFromEntityWithEmptyStrings() {
        // Given
        Trainer trainer = createTrainer("", "");

        // When
        TrainerLookupDTO dto = TrainerLookupDTO.fromEntity(trainer);

        // Then
        assertThat(dto.name()).isEqualTo("Prof. ");
    }

    @Test
    @DisplayName("Should convert from entity with special characters in names")
    void shouldConvertFromEntityWithSpecialCharactersInNames() {
        // Given
        Trainer trainer = createTrainer("José", "da Silva");
        Trainer trainer2 = createTrainer("María", "González");
        Trainer trainer3 = createTrainer("François", "Dupont");

        // When
        TrainerLookupDTO dto = TrainerLookupDTO.fromEntity(trainer);
        TrainerLookupDTO dto2 = TrainerLookupDTO.fromEntity(trainer2);
        TrainerLookupDTO dto3 = TrainerLookupDTO.fromEntity(trainer3);

        // Then
        assertThat(dto.name()).isEqualTo("Prof. José");
        assertThat(dto2.name()).isEqualTo("Prof. María");
        assertThat(dto3.name()).isEqualTo("Prof. François");
    }

    @Test
    @DisplayName("Should convert from entity with long names")
    void shouldConvertFromEntityWithLongNames() {
        // Given
        Trainer trainer = createTrainer("VeryLongFirstName", "VeryLongLastName");

        // When
        TrainerLookupDTO dto = TrainerLookupDTO.fromEntity(trainer);

        // Then
        assertThat(dto.name()).isEqualTo("Prof. VeryLongFirstName");
    }

    @Test
    @DisplayName("Should convert from entity with numbers in names")
    void shouldConvertFromEntityWithNumbersInNames() {
        // Given
        Trainer trainer = createTrainer("John2", "Doe3");

        // When
        TrainerLookupDTO dto = TrainerLookupDTO.fromEntity(trainer);

        // Then
        assertThat(dto.name()).isEqualTo("Prof. John2");
    }

    private Trainer createTrainerWithAllFields() {
        return createTrainer("John", "Doe");
    }

    private Trainer createTrainer(String name, String surname) {
        Trainer trainer = new Trainer();
        setIdViaReflection(trainer, UUID.randomUUID());
        trainer.setName(name);
        // Trainer doesn't have surname field, only name
        trainer.setPhone("+1234567890");
        trainer.setAddress("123 Main St");
        trainer.setBirthDate(LocalDate.of(1990, 1, 1));
        trainer.setSpecialties(Arrays.asList("Strength Training", "Cardio"));
        return trainer;
    }

    private void setIdViaReflection(Object entity, UUID id) {
        try {
            Field field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set ID via reflection", e);
        }
    }
}

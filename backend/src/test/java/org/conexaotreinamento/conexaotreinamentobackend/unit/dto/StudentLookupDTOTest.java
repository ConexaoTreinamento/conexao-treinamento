package org.conexaotreinamento.conexaotreinamentobackend.unit.dto;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentLookupDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("StudentLookupDTO Tests")
class StudentLookupDTOTest {

    @Test
    @DisplayName("Should create DTO with all fields")
    void shouldCreateDTOWithAllFields() {
        // Given
        UUID id = UUID.randomUUID();
        String name = "Alice Doe";

        // When
        StudentLookupDTO dto = new StudentLookupDTO(id, name);

        // Then
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.name()).isEqualTo(name);
    }

    @Test
    @DisplayName("Should create DTO with null values")
    void shouldCreateDTOWithNullValues() {
        // When
        StudentLookupDTO dto = new StudentLookupDTO(null, null);

        // Then
        assertThat(dto.id()).isNull();
        assertThat(dto.name()).isNull();
    }

    @Test
    @DisplayName("Should convert from entity with all fields")
    void shouldConvertFromEntityWithAllFields() {
        // Given
        Student student = createStudentWithAllFields();

        // When
        StudentLookupDTO dto = StudentLookupDTO.fromEntity(student);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.id()).isEqualTo(student.getId());
        assertThat(dto.name()).isEqualTo("Alice Doe");
    }

    @Test
    @DisplayName("Should convert from null entity")
    void shouldConvertFromNullEntity() {
        // When
        StudentLookupDTO dto = StudentLookupDTO.fromEntity(null);

        // Then
        assertThat(dto).isNull();
    }

    @Test
    @DisplayName("Should convert from entity with different name formats")
    void shouldConvertFromEntityWithDifferentNameFormats() {
        // Given
        Student student1 = createStudent("Alice", "Doe");
        Student student2 = createStudent("Bob", "Smith");
        Student student3 = createStudent("Charlie", "Brown");
        Student student4 = createStudent("Diana", "Prince");
        Student student5 = createStudent("Eve", "Adams");

        // When
        StudentLookupDTO dto1 = StudentLookupDTO.fromEntity(student1);
        StudentLookupDTO dto2 = StudentLookupDTO.fromEntity(student2);
        StudentLookupDTO dto3 = StudentLookupDTO.fromEntity(student3);
        StudentLookupDTO dto4 = StudentLookupDTO.fromEntity(student4);
        StudentLookupDTO dto5 = StudentLookupDTO.fromEntity(student5);

        // Then
        assertThat(dto1.name()).isEqualTo("Alice Doe");
        assertThat(dto2.name()).isEqualTo("Bob Smith");
        assertThat(dto3.name()).isEqualTo("Charlie Brown");
        assertThat(dto4.name()).isEqualTo("Diana Prince");
        assertThat(dto5.name()).isEqualTo("Eve Adams");
    }

    @Test
    @DisplayName("Should convert from entity with single name")
    void shouldConvertFromEntityWithSingleName() {
        // Given
        Student student = createStudent("Madonna", null);

        // When
        StudentLookupDTO dto = StudentLookupDTO.fromEntity(student);

        // Then
        assertThat(dto.name()).isEqualTo("Madonna null");
    }

    @Test
    @DisplayName("Should convert from entity with null surname")
    void shouldConvertFromEntityWithNullSurname() {
        // Given
        Student student = createStudent("Cher", null);

        // When
        StudentLookupDTO dto = StudentLookupDTO.fromEntity(student);

        // Then
        assertThat(dto.name()).isEqualTo("Cher null");
    }

    @Test
    @DisplayName("Should convert from entity with null name")
    void shouldConvertFromEntityWithNullName() {
        // Given
        Student student = createStudent(null, "Smith");

        // When
        StudentLookupDTO dto = StudentLookupDTO.fromEntity(student);

        // Then
        assertThat(dto.name()).isEqualTo("null Smith");
    }

    @Test
    @DisplayName("Should convert from entity with both names null")
    void shouldConvertFromEntityWithBothNamesNull() {
        // Given
        Student student = createStudent(null, null);

        // When
        StudentLookupDTO dto = StudentLookupDTO.fromEntity(student);

        // Then
        assertThat(dto.name()).isEqualTo("null null");
    }

    @Test
    @DisplayName("Should convert from entity with empty strings")
    void shouldConvertFromEntityWithEmptyStrings() {
        // Given
        Student student = createStudent("", "");

        // When
        StudentLookupDTO dto = StudentLookupDTO.fromEntity(student);

        // Then
        assertThat(dto.name()).isEqualTo(" ");
    }

    @Test
    @DisplayName("Should convert from entity with special characters in names")
    void shouldConvertFromEntityWithSpecialCharactersInNames() {
        // Given
        Student student = createStudent("José", "da Silva");
        Student student2 = createStudent("María", "González");
        Student student3 = createStudent("François", "Dupont");

        // When
        StudentLookupDTO dto = StudentLookupDTO.fromEntity(student);
        StudentLookupDTO dto2 = StudentLookupDTO.fromEntity(student2);
        StudentLookupDTO dto3 = StudentLookupDTO.fromEntity(student3);

        // Then
        assertThat(dto.name()).isEqualTo("José da Silva");
        assertThat(dto2.name()).isEqualTo("María González");
        assertThat(dto3.name()).isEqualTo("François Dupont");
    }

    private Student createStudentWithAllFields() {
        return createStudent("Alice", "Doe");
    }

    private Student createStudent(String name, String surname) {
        Student student = new Student("test@example.com", name, surname, Student.Gender.F, LocalDate.of(2000, 1, 1));
        setIdViaReflection(student, UUID.randomUUID());
        return student;
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

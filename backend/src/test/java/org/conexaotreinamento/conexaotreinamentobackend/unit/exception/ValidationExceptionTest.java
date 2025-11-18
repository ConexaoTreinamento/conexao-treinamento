package org.conexaotreinamento.conexaotreinamentobackend.unit.exception;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ValidationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ValidationException Unit Tests")
class ValidationExceptionTest {

    @Test
    @DisplayName("Should create exception with message only")
    void shouldCreateExceptionWithMessageOnly() {
        // When
        ValidationException ex = new ValidationException("Invalid input");

        // Then
        assertThat(ex).isNotNull();
        assertThat(ex.getMessage()).isEqualTo("Invalid input");
        assertThat(ex.getFieldErrors()).isNotNull();
        assertThat(ex.getFieldErrors()).isEmpty();
    }

    @Test
    @DisplayName("Should create exception with field and message")
    void shouldCreateExceptionWithFieldAndMessage() {
        // When
        ValidationException ex = new ValidationException("email", "Email is required");

        // Then
        assertThat(ex).isNotNull();
        assertThat(ex.getMessage()).isEqualTo("Validation failed");
        assertThat(ex.getFieldErrors()).isNotNull();
        assertThat(ex.getFieldErrors()).hasSize(1);
        assertThat(ex.getFieldErrors()).containsEntry("email", "Email is required");
    }

    @Test
    @DisplayName("Should create exception with field errors map")
    void shouldCreateExceptionWithFieldErrorsMap() {
        // Given
        Map<String, String> fieldErrors = new HashMap<>();
        fieldErrors.put("email", "Email is required");
        fieldErrors.put("name", "Name is required");

        // When
        ValidationException ex = new ValidationException(fieldErrors);

        // Then
        assertThat(ex).isNotNull();
        assertThat(ex.getMessage()).isEqualTo("Validation failed for multiple fields");
        assertThat(ex.getFieldErrors()).isNotNull();
        assertThat(ex.getFieldErrors()).hasSize(2);
        assertThat(ex.getFieldErrors()).containsEntry("email", "Email is required");
        assertThat(ex.getFieldErrors()).containsEntry("name", "Name is required");
    }

    @Test
    @DisplayName("Should create exception with message and field errors")
    void shouldCreateExceptionWithMessageAndFieldErrors() {
        // Given
        Map<String, String> fieldErrors = new HashMap<>();
        fieldErrors.put("email", "Email is invalid");

        // When
        ValidationException ex = new ValidationException("Multiple validation errors", fieldErrors);

        // Then
        assertThat(ex).isNotNull();
        assertThat(ex.getMessage()).isEqualTo("Multiple validation errors");
        assertThat(ex.getFieldErrors()).isNotNull();
        assertThat(ex.getFieldErrors()).hasSize(1);
        assertThat(ex.getFieldErrors()).containsEntry("email", "Email is invalid");
    }

    @Test
    @DisplayName("Should create exception with empty field errors map")
    void shouldCreateExceptionWithEmptyFieldErrorsMap() {
        // Given
        Map<String, String> fieldErrors = new HashMap<>();

        // When
        ValidationException ex = new ValidationException(fieldErrors);

        // Then
        assertThat(ex).isNotNull();
        assertThat(ex.getMessage()).isEqualTo("Validation failed for multiple fields");
        assertThat(ex.getFieldErrors()).isNotNull();
        assertThat(ex.getFieldErrors()).isEmpty();
    }
}


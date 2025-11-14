package org.conexaotreinamento.conexaotreinamentobackend.unit.exception;

import static org.assertj.core.api.Assertions.assertThat;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("BusinessException Unit Tests")
class BusinessExceptionTest {

    @Test
    @DisplayName("Should create exception with message only")
    void shouldCreateExceptionWithMessageOnly() {
        // When
        BusinessException ex = new BusinessException("Business rule violated");

        // Then
        assertThat(ex).isNotNull();
        assertThat(ex.getMessage()).isEqualTo("Business rule violated");
        assertThat(ex.getErrorCode()).isEqualTo("BUSINESS_RULE_VIOLATION");
    }

    @Test
    @DisplayName("Should create exception with message and error code")
    void shouldCreateExceptionWithMessageAndErrorCode() {
        // When
        BusinessException ex = new BusinessException("Duplicate entry", "DUPLICATE_ENTRY");

        // Then
        assertThat(ex).isNotNull();
        assertThat(ex.getMessage()).isEqualTo("Duplicate entry");
        assertThat(ex.getErrorCode()).isEqualTo("DUPLICATE_ENTRY");
    }

    @Test
    @DisplayName("Should create exception with message and cause")
    void shouldCreateExceptionWithMessageAndCause() {
        // Given
        Throwable cause = new RuntimeException("Root cause");

        // When
        BusinessException ex = new BusinessException("Business rule violated", cause);

        // Then
        assertThat(ex).isNotNull();
        assertThat(ex.getMessage()).isEqualTo("Business rule violated");
        assertThat(ex.getCause()).isEqualTo(cause);
        assertThat(ex.getErrorCode()).isEqualTo("BUSINESS_RULE_VIOLATION");
    }
}


package org.conexaotreinamento.conexaotreinamentobackend.unit.validation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ValidationException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.validation.AgeRangeValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("AgeRangeValidator Unit Tests")
class AgeRangeValidatorTest {

    private AgeRangeValidator validator;

    @BeforeEach
    void setUp() {
        validator = new AgeRangeValidator();
    }

    @Test
    @DisplayName("Should accept valid age range")
    void shouldAcceptValidAgeRange() {
        // When & Then
        assertThat(validator).isNotNull();
        validator.validate(18, 65);
        // No exception thrown
    }

    @Test
    @DisplayName("Should accept null minAge")
    void shouldAcceptNullMinAge() {
        // When & Then
        validator.validate(null, 65);
        // No exception thrown
    }

    @Test
    @DisplayName("Should accept null maxAge")
    void shouldAcceptNullMaxAge() {
        // When & Then
        validator.validate(18, null);
        // No exception thrown
    }

    @Test
    @DisplayName("Should accept both null")
    void shouldAcceptBothNull() {
        // When & Then
        validator.validate(null, null);
        // No exception thrown
    }

    @Test
    @DisplayName("Should accept equal min and max age")
    void shouldAcceptEqualMinAndMaxAge() {
        // When & Then
        validator.validate(25, 25);
        // No exception thrown
    }

    @Test
    @DisplayName("Should throw exception when minAge is negative")
    void shouldThrowExceptionWhenMinAgeIsNegative() {
        // When & Then
        assertThatThrownBy(() -> validator.validate(-1, null))
                .isInstanceOf(ValidationException.class)
                .satisfies(exception -> {
                    ValidationException vex = (ValidationException) exception;
                    assertThat(vex.getFieldErrors()).containsEntry("minAge", "minAge must be at least 0");
                });
    }

    @Test
    @DisplayName("Should throw exception when maxAge is negative")
    void shouldThrowExceptionWhenMaxAgeIsNegative() {
        // When & Then
        assertThatThrownBy(() -> validator.validate(null, -5))
                .isInstanceOf(ValidationException.class)
                .satisfies(exception -> {
                    ValidationException vex = (ValidationException) exception;
                    assertThat(vex.getFieldErrors()).containsEntry("maxAge", "maxAge must be at least 0");
                });
    }

    @Test
    @DisplayName("Should throw exception when minAge exceeds maximum")
    void shouldThrowExceptionWhenMinAgeExceedsMaximum() {
        // When & Then
        assertThatThrownBy(() -> validator.validate(151, null))
                .isInstanceOf(ValidationException.class)
                .satisfies(exception -> {
                    ValidationException vex = (ValidationException) exception;
                    assertThat(vex.getFieldErrors()).containsEntry("minAge", "minAge must be at most 150");
                });
    }

    @Test
    @DisplayName("Should throw exception when maxAge exceeds maximum")
    void shouldThrowExceptionWhenMaxAgeExceedsMaximum() {
        // When & Then
        assertThatThrownBy(() -> validator.validate(null, 200))
                .isInstanceOf(ValidationException.class)
                .satisfies(exception -> {
                    ValidationException vex = (ValidationException) exception;
                    assertThat(vex.getFieldErrors()).containsEntry("maxAge", "maxAge must be at most 150");
                });
    }

    @Test
    @DisplayName("Should throw exception when maxAge is less than minAge")
    void shouldThrowExceptionWhenMaxAgeIsLessThanMinAge() {
        // When & Then
        assertThatThrownBy(() -> validator.validate(65, 18))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("maxAge (18) must be greater than or equal to minAge (65)");
    }

    @Test
    @DisplayName("Should accept minimum age (0)")
    void shouldAcceptMinimumAge() {
        // When & Then
        validator.validate(0, null);
        validator.validate(null, 0);
        validator.validate(0, 0);
        // No exception thrown
    }

    @Test
    @DisplayName("Should accept maximum age (150)")
    void shouldAcceptMaximumAge() {
        // When & Then
        validator.validate(150, null);
        validator.validate(null, 150);
        validator.validate(150, 150);
        // No exception thrown
    }
}


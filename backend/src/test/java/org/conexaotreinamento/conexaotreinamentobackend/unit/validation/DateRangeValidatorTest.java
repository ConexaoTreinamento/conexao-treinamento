package org.conexaotreinamento.conexaotreinamentobackend.unit.validation;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ValidationException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.validation.DateRangeValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("DateRangeValidator Unit Tests")
class DateRangeValidatorTest {

    private DateRangeValidator validator;

    @BeforeEach
    void setUp() {
        validator = new DateRangeValidator();
    }

    @Test
    @DisplayName("Should accept valid date range")
    void shouldAcceptValidDateRange() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);

        // When & Then
        validator.validate(startDate, endDate);
        // No exception thrown
    }

    @Test
    @DisplayName("Should accept null startDate")
    void shouldAcceptNullStartDate() {
        // Given
        LocalDate endDate = LocalDate.of(2024, 12, 31);

        // When & Then
        validator.validate(null, endDate);
        // No exception thrown
    }

    @Test
    @DisplayName("Should accept null endDate")
    void shouldAcceptNullEndDate() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 1, 1);

        // When & Then
        validator.validate(startDate, null);
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
    @DisplayName("Should accept equal dates")
    void shouldAcceptEqualDates() {
        // Given
        LocalDate date = LocalDate.of(2024, 6, 15);

        // When & Then
        validator.validate(date, date);
        // No exception thrown
    }

    @Test
    @DisplayName("Should throw exception when endDate is before startDate")
    void shouldThrowExceptionWhenEndDateIsBeforeStartDate() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 12, 31);
        LocalDate endDate = LocalDate.of(2024, 1, 1);

        // When & Then
        assertThatThrownBy(() -> validator.validate(startDate, endDate))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("End date")
                .hasMessageContaining("must be after or equal to start date");
    }

    @Test
    @DisplayName("Should accept valid max range")
    void shouldAcceptValidMaxRange() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 1, 31);
        long maxDays = 365;

        // When & Then
        validator.validateMaxRange(startDate, endDate, maxDays);
        // No exception thrown
    }

    @Test
    @DisplayName("Should accept null dates in validateMaxRange")
    void shouldAcceptNullDatesInValidateMaxRange() {
        // When & Then
        validator.validateMaxRange(null, null, 365);
        validator.validateMaxRange(LocalDate.of(2024, 1, 1), null, 365);
        validator.validateMaxRange(null, LocalDate.of(2024, 1, 31), 365);
        // No exception thrown
    }

    @Test
    @DisplayName("Should throw exception when range exceeds maxDays")
    void shouldThrowExceptionWhenRangeExceedsMaxDays() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        long maxDays = 30;

        // When & Then
        assertThatThrownBy(() -> validator.validateMaxRange(startDate, endDate, maxDays))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Date range cannot exceed")
                .hasMessageContaining("days");
    }

    @Test
    @DisplayName("Should accept range equal to maxDays")
    void shouldAcceptRangeEqualToMaxDays() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 1, 31);
        long maxDays = 30;

        // When & Then
        validator.validateMaxRange(startDate, endDate, maxDays);
        // No exception thrown
    }
}


package org.conexaotreinamento.conexaotreinamentobackend.shared.validation;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ValidationException;
import org.springframework.stereotype.Component;

/**
 * Validator for date range parameters.
 */
@Component
public class DateRangeValidator {
    
    /**
     * Validates that startDate and endDate are logically consistent.
     * 
     * @param startDate Start date of the range (optional)
     * @param endDate End date of the range (optional)
     * @throws ValidationException if endDate is before startDate
     */
    public void validate(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null) {
            if (endDate.isBefore(startDate)) {
                throw new ValidationException(
                    String.format("End date (%s) must be after or equal to start date (%s)", endDate, startDate)
                );
            }
        }
    }
    
    /**
     * Validates that startDate and endDate are within a maximum range.
     * 
     * @param startDate Start date of the range
     * @param endDate End date of the range
     * @param maxDays Maximum allowed days between dates
     * @throws ValidationException if range exceeds maxDays
     */
    public void validateMaxRange(LocalDate startDate, LocalDate endDate, long maxDays) {
        if (startDate != null && endDate != null) {
            long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
            
            if (daysBetween > maxDays) {
                throw new ValidationException(
                    String.format("Date range cannot exceed %d days. Current range: %d days", maxDays, daysBetween)
                );
            }
        }
    }
}


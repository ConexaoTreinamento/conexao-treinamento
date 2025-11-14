package org.conexaotreinamento.conexaotreinamentobackend.shared.validation;

import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ValidationException;
import org.springframework.stereotype.Component;

/**
 * Validator for age range parameters.
 */
@Component
public class AgeRangeValidator {
    
    private static final int MIN_AGE = 0;
    private static final int MAX_AGE = 150;
    
    /**
     * Validates that minAge and maxAge are within acceptable bounds and logically consistent.
     * 
     * @param minAge Minimum age filter (optional)
     * @param maxAge Maximum age filter (optional)
     * @throws ValidationException if validation fails
     */
    public void validate(Integer minAge, Integer maxAge) {
        if (minAge != null) {
            validateSingleAge(minAge, "minAge");
        }
        
        if (maxAge != null) {
            validateSingleAge(maxAge, "maxAge");
        }
        
        if (minAge != null && maxAge != null) {
            if (maxAge < minAge) {
                throw new ValidationException(
                    String.format("maxAge (%d) must be greater than or equal to minAge (%d)", maxAge, minAge)
                );
            }
        }
    }
    
    private void validateSingleAge(Integer age, String fieldName) {
        if (age < MIN_AGE) {
            throw new ValidationException(
                fieldName,
                String.format("%s must be at least %d", fieldName, MIN_AGE)
            );
        }
        
        if (age > MAX_AGE) {
            throw new ValidationException(
                fieldName,
                String.format("%s must be at most %d", fieldName, MAX_AGE)
            );
        }
    }
}


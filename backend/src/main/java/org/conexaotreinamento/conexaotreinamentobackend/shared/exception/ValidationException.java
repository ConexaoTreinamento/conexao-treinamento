package org.conexaotreinamento.conexaotreinamentobackend.shared.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.Map;
import java.util.HashMap;

/**
 * Exception thrown when validation fails outside of Bean Validation.
 * Automatically mapped to HTTP 400 Bad Request status.
 */
@Getter
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ValidationException extends RuntimeException {
    
    private final Map<String, String> fieldErrors;
    
    public ValidationException(String message) {
        super(message);
        this.fieldErrors = new HashMap<>();
    }
    
    public ValidationException(String field, String message) {
        super("Validation failed");
        this.fieldErrors = Map.of(field, message);
    }
    
    public ValidationException(Map<String, String> fieldErrors) {
        super("Validation failed for multiple fields");
        this.fieldErrors = fieldErrors;
    }
    
    public ValidationException(String message, Map<String, String> fieldErrors) {
        super(message);
        this.fieldErrors = fieldErrors;
    }
}



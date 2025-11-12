package org.conexaotreinamento.conexaotreinamentobackend.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.ErrorResponse;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.ValidationErrorResponse;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.BusinessException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ResourceNotFoundException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ValidationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpServerErrorException.InternalServerError;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;

/**
 * Global exception handler for all API errors.
 * Provides consistent error responses across the entire application.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles custom ResourceNotFoundException.
     * Maps to HTTP 404 Not Found.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, 
            HttpServletRequest req) {
        
        log.warn("Resource not found: {} - {}", ex.getResourceType(), ex.getResourceId());
        
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message(ex.getMessage())
                .path(req.getRequestURI())
                .errorCode("RESOURCE_NOT_FOUND")
                .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Handles custom BusinessException.
     * Maps to HTTP 409 Conflict.
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            BusinessException ex, 
            HttpServletRequest req) {
        
        log.warn("Business rule violation: {}", ex.getMessage());
        
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Business Rule Violation")
                .message(ex.getMessage())
                .path(req.getRequestURI())
                .errorCode(ex.getErrorCode())
                .build();
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Handles custom ValidationException (non-Bean Validation).
     * Maps to HTTP 400 Bad Request.
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationException(
            ValidationException ex,
            HttpServletRequest req) {
        
        log.warn("Validation exception: {}", ex.getMessage());
        
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getFieldErrors().forEach((field, message) -> 
            fieldErrors.put(field, message)
        );
        
        ValidationErrorResponse error = ValidationErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(ex.getMessage())
                .path(req.getRequestURI())
                .errorCode("VALIDATION_ERROR")
                .fieldErrors(fieldErrors)
                .build();
        
        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Handles Spring's ResponseStatusException.
     * Used by legacy code until fully refactored.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(
            ResponseStatusException ex, 
            HttpServletRequest req) {
        
        log.warn("ResponseStatusException: {} - {} [{}]", ex.getStatusCode(), ex.getReason(), req.getRequestURI());
        
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(ex.getStatusCode().value())
                .error(HttpStatus.valueOf(ex.getStatusCode().value()).getReasonPhrase())
                .message(ex.getReason())
                .path(req.getRequestURI())
                .build();
        
        return ResponseEntity.status(ex.getStatusCode()).body(error);
    }

    /**
     * Handles Bean Validation errors (e.g., @Valid on request bodies).
     * Maps to HTTP 400 Bad Request.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, 
            HttpServletRequest req) {
        
        Map<String, List<String>> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe -> 
            errors.computeIfAbsent(fe.getField(), k -> new ArrayList<>())
                  .add(fe.getDefaultMessage())
        );
        
        // Convert List<String> to String by joining
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        errors.forEach((field, messages) -> 
            fieldErrors.put(field, String.join("; ", messages))
        );
        
        log.warn("Validation failed for {} - Fields: {}", req.getRequestURI(), fieldErrors.keySet());
        
        ValidationErrorResponse error = ValidationErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Validation failed")
                .path(req.getRequestURI())
                .errorCode("VALIDATION_ERROR")
                .fieldErrors(fieldErrors)
                .build();
        
        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Handles constraint violations (e.g., @Validated on controller methods).
     * Maps to HTTP 400 Bad Request.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ValidationErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, 
            HttpServletRequest req) {
        
        Map<String, List<String>> errors = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(v -> 
            errors.computeIfAbsent(v.getPropertyPath().toString(), k -> new ArrayList<>())
                  .add(v.getMessage())
        );
        
        // Convert List<String> to String by joining
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        errors.forEach((field, messages) -> 
            fieldErrors.put(field, String.join("; ", messages))
        );
        
        log.warn("Constraint violation for {} - Fields: {}", req.getRequestURI(), fieldErrors.keySet());
        
        ValidationErrorResponse error = ValidationErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Validation failed")
                .path(req.getRequestURI())
                .errorCode("VALIDATION_ERROR")
                .fieldErrors(fieldErrors)
                .build();
        
        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Handles internal server errors.
     * Maps to HTTP 500 Internal Server Error.
     */
    @ExceptionHandler(InternalServerError.class)
    public ResponseEntity<ErrorResponse> handleInternalServerError(
            InternalServerError ex, 
            HttpServletRequest req) {
        
        String errorId = UUID.randomUUID().toString();
        log.error("Internal server error [{}] at {} - {}: {}", 
                errorId, req.getRequestURI(), ex.getClass().getSimpleName(), ex.getMessage(), ex);
        
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message("An unexpected error occurred. Error ID: " + errorId)
                .path(req.getRequestURI())
                .traceId(errorId)
                .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    /**
     * Catch-all handler for any unexpected exceptions.
     * Maps to HTTP 500 Internal Server Error.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, 
            HttpServletRequest req) {
        
        String errorId = UUID.randomUUID().toString();
        log.error("Unexpected error [{}] at {} - {}: {}", 
                errorId, req.getRequestURI(), ex.getClass().getSimpleName(), ex.getMessage(), ex);
        
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message("An unexpected error occurred. Please contact support with Error ID: " + errorId)
                .path(req.getRequestURI())
                .traceId(errorId)
                .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

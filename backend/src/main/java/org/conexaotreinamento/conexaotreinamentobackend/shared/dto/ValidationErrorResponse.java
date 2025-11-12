package org.conexaotreinamento.conexaotreinamentobackend.shared.dto;

import java.time.Instant;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

/**
 * Response for validation errors with field-level details.
 */
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Validation error response with field-level details")
public record ValidationErrorResponse(
        
        @Schema(description = "Timestamp of the error", example = "2024-01-15T10:30:00Z")
        Instant timestamp,
        
        @Schema(description = "HTTP status code", example = "400")
        int status,
        
        @Schema(description = "HTTP status description", example = "Bad Request")
        String error,
        
        @Schema(description = "General error message", example = "Validation failed")
        String message,
        
        @Schema(description = "Request path", example = "/students")
        String path,
        
        @Schema(description = "Application-specific error code", example = "VALIDATION_ERROR")
        String errorCode,
        
        @Schema(description = "Map of field names to error messages")
        Map<String, String> fieldErrors
) {
}


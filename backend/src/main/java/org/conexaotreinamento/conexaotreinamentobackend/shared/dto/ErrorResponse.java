package org.conexaotreinamento.conexaotreinamentobackend.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.Instant;

/**
 * Standard error response DTO for all API errors.
 */
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Standard error response")
public record ErrorResponse(
        
        @Schema(description = "Timestamp when the error occurred", example = "2025-01-15T10:30:00Z")
        Instant timestamp,
        
        @Schema(description = "HTTP status code", example = "404")
        int status,
        
        @Schema(description = "HTTP status reason phrase", example = "Not Found")
        String error,
        
        @Schema(description = "Detailed error message", example = "Student not found with id: 123e4567-e89b-12d3-a456-426614174000")
        String message,
        
        @Schema(description = "Request path that caused the error", example = "/students/123e4567-e89b-12d3-a456-426614174000")
        String path,
        
        @Schema(description = "Optional error code for client handling", example = "RESOURCE_NOT_FOUND")
        String errorCode,
        
        @Schema(description = "Optional trace ID for debugging")
        String traceId
) {
    
    public static ErrorResponse of(int status, String error, String message, String path) {
        return ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .build();
    }
}



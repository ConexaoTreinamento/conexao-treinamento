package org.conexaotreinamento.conexaotreinamentobackend.shared.exception;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import lombok.Getter;

/**
 * Exception thrown when a requested resource is not found.
 * Automatically mapped to HTTP 404 status.
 */
@Getter
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    
    private final String resourceType;
    private final Object resourceId;
    
    public ResourceNotFoundException(String resourceType, UUID resourceId) {
        super(String.format("%s not found with id: %s", resourceType, resourceId));
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }
    
    public ResourceNotFoundException(String resourceType, String resourceIdentifier, Object value) {
        super(String.format("%s not found with %s: %s", resourceType, resourceIdentifier, value));
        this.resourceType = resourceType;
        this.resourceId = value;
    }
    
    public ResourceNotFoundException(String message) {
        super(message);
        this.resourceType = "Resource";
        this.resourceId = null;
    }
}



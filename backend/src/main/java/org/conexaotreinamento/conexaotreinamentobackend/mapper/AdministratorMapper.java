package org.conexaotreinamento.conexaotreinamentobackend.mapper;

import java.time.Instant;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AdministratorCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Administrator entities and DTOs.
 */
@Component
public class AdministratorMapper {
    
    /**
     * Maps Administrator entity to AdministratorListItemResponseDTO.
     */
    public AdministratorListItemResponseDTO toListItemResponse(Administrator entity, String email, boolean active, Instant joinDate) {
        return new AdministratorListItemResponseDTO(
                entity.getId(),
                entity.getFirstName(),
                entity.getLastName(),
                email,
                entity.getFullName(),
                active,
                joinDate
        );
    }
    
    /**
     * Maps Administrator entity to AdministratorResponseDTO.
     */
    public AdministratorResponseDTO toResponse(Administrator entity, String email, boolean active, 
                                                Instant createdAt, Instant updatedAt) {
        return new AdministratorResponseDTO(
                entity.getId(),
                entity.getFirstName(),
                entity.getLastName(),
                email,
                entity.getFullName(),
                active,
                createdAt,
                updatedAt
        );
    }
    
    /**
     * Maps AdministratorCreateRequestDTO to new Administrator entity.
     */
    public Administrator toEntity(AdministratorCreateRequestDTO request, UUID userId) {
        Administrator admin = new Administrator();
        admin.setUserId(userId);
        admin.setFirstName(request.firstName());
        admin.setLastName(request.lastName());
        return admin;
    }
    
    /**
     * Updates existing Administrator entity with data from AdministratorCreateRequestDTO.
     */
    public void updateEntity(AdministratorCreateRequestDTO request, Administrator entity) {
        entity.setFirstName(request.firstName());
        entity.setLastName(request.lastName());
    }
    
    /**
     * Partially updates existing Administrator entity with non-null fields from PatchAdministratorRequestDTO.
     */
    public void patchEntity(PatchAdministratorRequestDTO request, Administrator entity) {
        if (request.firstName() != null) {
            entity.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            entity.setLastName(request.lastName());
        }
    }
}


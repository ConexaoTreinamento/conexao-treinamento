package org.conexaotreinamento.conexaotreinamentobackend.mapper;

import java.time.Instant;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerListItemResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Trainer entities and DTOs.
 */
@Component
public class TrainerMapper {
    
    /**
     * Maps Trainer entity to TrainerListItemResponseDTO.
     */
    public TrainerListItemResponseDTO toListItemResponse(Trainer entity, String email, boolean active, Instant joinDate) {
        return new TrainerListItemResponseDTO(
                entity.getId(),
                entity.getName(),
                email,
                entity.getPhone(),
                entity.getAddress(),
                entity.getBirthDate(),
                entity.getSpecialties(),
                entity.getCompensationType(),
                active,
                joinDate
        );
    }
    
    /**
     * Maps Trainer entity to TrainerResponseDTO.
     */
    public TrainerResponseDTO toResponse(Trainer entity, String email, Instant joinDate) {
        return new TrainerResponseDTO(
                entity.getId(),
                entity.getName(),
                email,
                entity.getPhone(),
                entity.getAddress(),
                entity.getBirthDate(),
                entity.getSpecialties(),
                entity.getCompensationType(),
                joinDate
        );
    }
    
    /**
     * Maps TrainerCreateRequestDTO to new Trainer entity.
     */
    public Trainer toEntity(TrainerCreateRequestDTO request, java.util.UUID userId) {
        Trainer trainer = new Trainer();
        trainer.setUserId(userId);
        trainer.setName(request.name());
        trainer.setPhone(request.phone());
        trainer.setAddress(request.address());
        trainer.setBirthDate(request.birthDate());
        trainer.setSpecialties(request.specialties());
        trainer.setCompensationType(request.compensationType());
        return trainer;
    }
    
    /**
     * Updates existing Trainer entity with data from TrainerCreateRequestDTO.
     */
    public void updateEntity(TrainerCreateRequestDTO request, Trainer entity) {
        entity.setName(request.name());
        entity.setPhone(request.phone());
        entity.setAddress(request.address());
        entity.setBirthDate(request.birthDate());
        entity.setSpecialties(request.specialties());
        entity.setCompensationType(request.compensationType());
    }
}


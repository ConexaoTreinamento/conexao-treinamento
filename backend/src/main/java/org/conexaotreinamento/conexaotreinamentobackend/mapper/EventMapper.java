package org.conexaotreinamento.conexaotreinamentobackend.mapper;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.EventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchEventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.EventResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Event entities and DTOs.
 */
@Component
public class EventMapper {
    
    /**
     * Converts Event entity to EventResponseDTO.
     */
    public EventResponseDTO toResponse(Event entity) {
        return EventResponseDTO.fromEntity(entity);
    }
    
    /**
     * Converts EventRequestDTO to new Event entity.
     */
    public Event toEntity(EventRequestDTO request, Trainer trainer) {
        Event event = new Event(request.name(), request.date());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setLocation(request.location());
        event.setDescription(request.description());
        event.setTrainer(trainer);
        return event;
    }
    
    /**
     * Updates existing Event entity with data from EventRequestDTO.
     */
    public void updateEntity(EventRequestDTO request, Event entity, Trainer trainer) {
        entity.setName(request.name());
        entity.setDate(request.date());
        entity.setStartTime(request.startTime());
        entity.setEndTime(request.endTime());
        entity.setLocation(request.location());
        entity.setDescription(request.description());
        entity.setTrainer(trainer);
    }
    
    /**
     * Partially updates existing Event entity with non-null fields from PatchEventRequestDTO.
     */
    public void patchEntity(PatchEventRequestDTO request, Event entity, Trainer trainer) {
        if (request.name() != null) {
            entity.setName(request.name());
        }
        if (request.date() != null) {
            entity.setDate(request.date());
        }
        if (request.startTime() != null) {
            entity.setStartTime(request.startTime());
        }
        if (request.endTime() != null) {
            entity.setEndTime(request.endTime());
        }
        if (request.location() != null) {
            entity.setLocation(request.location());
        }
        if (request.description() != null) {
            entity.setDescription(request.description());
        }
        if (trainer != null) {
            entity.setTrainer(trainer);
        }
    }
}


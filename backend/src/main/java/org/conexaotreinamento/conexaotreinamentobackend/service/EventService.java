package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateEventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchEventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.UpdateEventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.EventResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;
import org.conexaotreinamento.conexaotreinamentobackend.repository.EventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository repository;

    @Transactional
    public EventResponseDTO createEvent(CreateEventRequestDTO request) {
        Event e = new Event(request.name(), request.date());
        e.setStartTime(request.startTime());
        e.setEndTime(request.endTime());
        e.setLocation(request.location());
        e.setDescription(request.description());
        e.setInstructor(request.instructor());
        e.setParticipants(request.participants());
        Event saved = repository.save(e);
        return EventResponseDTO.fromEntity(saved);
    }

    public EventResponseDTO findEventById(UUID id) {
        Event e = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        return EventResponseDTO.fromEntity(e);
    }

    public Page<EventResponseDTO> findAllEvents(String search, Pageable pageable, boolean includeInactive) {
        Page<Event> events;
        if (search == null || search.isBlank()) {
            if (pageable.getSort().isUnsorted()) {
                pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                        Sort.by("createdAt").descending());
            }
            events = includeInactive ? repository.findAll(pageable) : repository.findByDeletedAtIsNull(pageable);
        } else {
            String term = "%" + search.toLowerCase() + "%";
            events = includeInactive ?
                    repository.findBySearchTermIncludingInactive(term, pageable) :
                    repository.findBySearchTermAndDeletedAtIsNull(term, pageable);
        }

        return events.map(EventResponseDTO::fromEntity);
    }

    @Transactional
    public EventResponseDTO updateEvent(UUID id, UpdateEventRequestDTO request) {
        Event e = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        e.setName(request.name());
        e.setDate(request.date());
        e.setStartTime(request.startTime());
        e.setEndTime(request.endTime());
        e.setLocation(request.location());
        e.setDescription(request.description());
        e.setInstructor(request.instructor());
        e.setParticipants(request.participants());

        return EventResponseDTO.fromEntity(e);
    }

    @Transactional
    public EventResponseDTO patchEvent(UUID id, PatchEventRequestDTO request) {
        Event e = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (request.name() != null) e.setName(request.name());
        if (request.date() != null) e.setDate(request.date());
        if (request.startTime() != null) e.setStartTime(request.startTime());
        if (request.endTime() != null) e.setEndTime(request.endTime());
        if (request.location() != null) e.setLocation(request.location());
        if (request.description() != null) e.setDescription(request.description());
        if (request.instructor() != null) e.setInstructor(request.instructor());
        if (request.participants() != null) e.setParticipants(request.participants());

        return EventResponseDTO.fromEntity(e);
    }

    @Transactional
    public void deleteEvent(UUID id) {
        Event e = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        e.deactivate();
        repository.save(e);
    }

    @Transactional
    public EventResponseDTO restoreEvent(UUID id) {
        Event e = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (e.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event is already active");
        }

        e.activate();
        repository.save(e);
        return EventResponseDTO.fromEntity(e);
    }
}

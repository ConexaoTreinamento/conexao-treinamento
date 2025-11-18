package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.EventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchEventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.EventResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;
import org.conexaotreinamento.conexaotreinamentobackend.entity.EventParticipant;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.EventMapper;
import org.conexaotreinamento.conexaotreinamentobackend.repository.EventParticipantRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.EventRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.BusinessException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ResourceNotFoundException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ValidationException;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing Event entities and their participants.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final EventParticipantRepository participantRepository;
    private final StudentRepository studentRepository;
    private final TrainerRepository trainerRepository;
    private final EventMapper eventMapper;

    /**
     * Creates a new event with optional participants.
     * 
     * @param request Event creation request
     * @return Created event
     * @throws ResourceNotFoundException if trainer not found
     * @throws ValidationException if trainer ID is not provided
     */
    public EventResponseDTO createEvent(EventRequestDTO request) {
        log.info("Creating event: {} - Date: {}", request.name(), request.date());
        
        Trainer trainer = findTrainerById(request.trainerId());
        Event event = eventMapper.toEntity(request, trainer);
        Event saved = eventRepository.save(event);
        
        log.info("Event created successfully [ID: {}] - Name: {}", saved.getId(), saved.getName());

        // Add participants if provided
        if (request.participantIds() != null && !request.participantIds().isEmpty()) {
            log.debug("Adding {} participants to event [ID: {}]", request.participantIds().size(), saved.getId());
            addParticipantsToEvent(saved, request.participantIds());
        }

        return eventMapper.toResponse(eventRepository.findById(saved.getId()).orElseThrow());
    }

    /**
     * Finds an event by ID.
     * 
     * @param id Event ID
     * @return Event details
     * @throws ResourceNotFoundException if event not found
     */
    public EventResponseDTO findEventById(UUID id) {
        log.debug("Finding event by ID: {}", id);
        Event event = findEntityById(id);
        return eventMapper.toResponse(event);
    }

    /**
     * Finds all events with optional search filtering.
     * 
     * @param search Search term (optional)
     * @param includeInactive Whether to include soft-deleted events
     * @return List of events
     */
    public List<EventResponseDTO> findAllEvents(String search, boolean includeInactive) {
        log.debug("Finding all events - Search: {}, Include inactive: {}", search, includeInactive);
        
        List<Event> events;
        if (search == null || search.isBlank()) {
            events = includeInactive 
                    ? eventRepository.findAllByOrderByCreatedAtDesc() 
                    : eventRepository.findByDeletedAtIsNullOrderByCreatedAtDesc();
        } else {
            String term = "%" + search.toLowerCase() + "%";
            events = includeInactive
                    ? eventRepository.findBySearchTermIncludingInactiveOrderByCreatedAtDesc(term)
                    : eventRepository.findBySearchTermAndDeletedAtIsNullOrderByCreatedAtDesc(term);
        }

        log.debug("Found {} events", events.size());
        return events.stream().map(eventMapper::toResponse).toList();
    }

    /**
     * Updates an existing event.
     * 
     * @param id Event ID
     * @param request Updated event data
     * @return Updated event
     * @throws ResourceNotFoundException if event or trainer not found
     */
    public EventResponseDTO updateEvent(UUID id, EventRequestDTO request) {
        log.info("Updating event [ID: {}] - Name: {}", id, request.name());
        
        Event event = findEntityById(id);
        Trainer trainer = findTrainerById(request.trainerId());
        
        eventMapper.updateEntity(request, event, trainer);
        Event saved = eventRepository.save(event);

        // Update participants if provided
        if (request.participantIds() != null) {
            log.debug("Updating participants for event [ID: {}] - {} participants", id, request.participantIds().size());
            updateEventParticipants(saved, request.participantIds());
        }

        log.info("Event updated successfully [ID: {}] - Name: {}", id, saved.getName());
        return eventMapper.toResponse(saved);
    }

    /**
     * Partially updates an event with only provided fields.
     * 
     * @param id Event ID
     * @param request Partial update request
     * @return Updated event
     * @throws ResourceNotFoundException if event or trainer not found
     */
    public EventResponseDTO patchEvent(UUID id, PatchEventRequestDTO request) {
        log.info("Patching event [ID: {}]", id);
        
        Event event = findEntityById(id);
        
        Trainer trainer = request.trainerId() != null 
                ? findTrainerById(request.trainerId()) 
                : null;
        
        eventMapper.patchEntity(request, event, trainer);
        Event saved = eventRepository.save(event);
        
        if (request.participantIds() != null) {
            updateEventParticipants(saved, request.participantIds());
        }

        log.info("Event patched successfully [ID: {}]", id);
        return eventMapper.toResponse(saved);
    }

    /**
     * Soft deletes an event.
     * 
     * @param id Event ID
     * @throws ResourceNotFoundException if event not found
     */
    public void deleteEvent(UUID id) {
        log.info("Deleting event [ID: {}]", id);
        
        Event event = findEntityById(id);
        event.deactivate();
        eventRepository.save(event);
        
        log.info("Event deleted successfully [ID: {}]", id);
    }

    /**
     * Restores a soft-deleted event.
     * 
     * @param id Event ID
     * @return Restored event
     * @throws ResourceNotFoundException if event not found
     * @throws BusinessException if event is already active
     */
    public EventResponseDTO restoreEvent(UUID id) {
        log.info("Restoring event [ID: {}]", id);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));

        if (event.isActive()) {
            throw new BusinessException("Event is already active", "ALREADY_ACTIVE");
        }

        event.activate();
        Event saved = eventRepository.save(event);
        
        log.info("Event restored successfully [ID: {}]", id);
        return eventMapper.toResponse(saved);
    }

    /**
     * Helper method to find a trainer by ID.
     * 
     * @param trainerId Trainer ID
     * @return Trainer entity
     * @throws ValidationException if trainer ID is null
     * @throws ResourceNotFoundException if trainer not found
     */
    private Trainer findTrainerById(UUID trainerId) {
        if (trainerId == null) {
            throw new ValidationException("Trainer ID is required");
        }
        return trainerRepository.findById(trainerId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer", trainerId));
    }
    
    /**
     * Helper method to find an active event entity by ID.
     * 
     * @param id Event ID
     * @return Event entity
     * @throws ResourceNotFoundException if not found or inactive
     */
    private Event findEntityById(UUID id) {
        return eventRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
    }

    /**
     * Adds participants to an event (without duplicates).
     */
    private void addParticipantsToEvent(Event event, List<UUID> participantIds) {
        for (UUID studentId : participantIds) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

            if (!participantRepository.existsByEventIdAndStudentId(event.getId(), studentId)) {
                EventParticipant participant = new EventParticipant(event, student);
                participantRepository.save(participant);
            }
        }
    }

    /**
     * Updates event participants by removing old ones and adding new ones.
     */
    private void updateEventParticipants(Event event, List<UUID> participantIds) {
        // Remove existing participants not in the new list
        List<EventParticipant> currentParticipants = event.getParticipants();
        if (currentParticipants != null) {
            currentParticipants.removeIf(participant -> {
                if (!participantIds.contains(participant.getStudent().getId())) {
                    participantRepository.delete(participant);
                    return true;
                }
                return false;
            });
        }

        // Add new participants
        addParticipantsToEvent(event, participantIds);
    }

    /**
     * Adds a participant to an event.
     * 
     * @param eventId Event ID
     * @param studentId Student ID
     * @return Updated event
     * @throws ResourceNotFoundException if event or student not found
     * @throws BusinessException if student is already enrolled
     */
    public EventResponseDTO addParticipant(UUID eventId, UUID studentId) {
        log.info("Adding participant [Student ID: {}] to event [ID: {}]", studentId, eventId);
        
        Event event = findEntityById(eventId);
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

        if (participantRepository.existsByEventIdAndStudentId(eventId, studentId)) {
            throw new BusinessException(
                    "Student already enrolled in this event",
                    "DUPLICATE_PARTICIPANT"
            );
        }

        EventParticipant participant = new EventParticipant(event, student);
        participantRepository.save(participant);
        
        log.info("Participant added successfully - Student: {} to Event [ID: {}]", student.getName(), eventId);
        return eventMapper.toResponse(eventRepository.findById(eventId).orElseThrow());
    }

    /**
     * Removes a participant from an event.
     * 
     * @param eventId Event ID
     * @param studentId Student ID
     * @throws ResourceNotFoundException if event not found or student not enrolled
     */
    public void removeParticipant(UUID eventId, UUID studentId) {
        log.info("Removing participant [Student ID: {}] from event [ID: {}]", studentId, eventId);
        
        if (!eventRepository.existsByIdAndDeletedAtIsNull(eventId)) {
            throw new ResourceNotFoundException("Event", eventId);
        }

        if (!participantRepository.existsByEventIdAndStudentId(eventId, studentId)) {
            throw new ResourceNotFoundException("Participant", "studentId", studentId);
        }

        participantRepository.deleteByEventIdAndStudentId(eventId, studentId);
        log.info("Participant removed successfully - Student [ID: {}] from Event [ID: {}]", studentId, eventId);
    }

    /**
     * Toggles the attendance status of a participant.
     * 
     * @param eventId Event ID
     * @param studentId Student ID
     * @return Updated event
     * @throws ResourceNotFoundException if participant not found
     */
    public EventResponseDTO toggleAttendance(UUID eventId, UUID studentId) {
        log.info("Toggling attendance for participant [Student ID: {}] in event [ID: {}]", studentId, eventId);
        
        EventParticipant participant = participantRepository.findByEventIdAndStudentId(eventId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Participant", "studentId", studentId));

        boolean newAttendanceStatus = !participant.getPresent();
        participant.setPresent(newAttendanceStatus);
        participantRepository.save(participant);
        
        log.info("Attendance toggled successfully - Student [ID: {}] in Event [ID: {}] - Present: {}", 
                studentId, eventId, newAttendanceStatus);

        return eventMapper.toResponse(eventRepository.findById(eventId).orElseThrow());
    }
}

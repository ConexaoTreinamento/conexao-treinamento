package org.conexaotreinamento.conexaotreinamentobackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.EventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchEventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.EventResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;
import org.conexaotreinamento.conexaotreinamentobackend.entity.EventParticipant;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.repository.EventParticipantRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.EventRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository repository;
    private final EventParticipantRepository participantRepository;
    private final StudentRepository studentRepository;
    private final TrainerRepository trainerRepository;

    @Transactional
    public EventResponseDTO createEvent(EventRequestDTO request) {
        log.debug("Creating event - Name: {}, Date: {}, Trainer ID: {}", request.name(), request.date(), request.trainerId());
        
        Event e = new Event(request.name(), request.date());
        e.setStartTime(request.startTime());
        e.setEndTime(request.endTime());
        e.setLocation(request.location());
        e.setDescription(request.description());
        e.setTrainer(findTrainer(request.trainerId()));

        Event saved = repository.save(e);
        log.info("Event created successfully [ID: {}] - Name: {}", saved.getId(), saved.getName());

        // Add participants if provided
        if (request.participantIds() != null && !request.participantIds().isEmpty()) {
            log.debug("Adding {} participants to event [ID: {}]", request.participantIds().size(), saved.getId());
            addParticipantsToEvent(saved, request.participantIds());
        }

        return EventResponseDTO.fromEntity(repository.findById(saved.getId()).orElseThrow());
    }

    public EventResponseDTO findEventById(UUID id) {
        log.debug("Finding event by ID: {}", id);
        Event e = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        return EventResponseDTO.fromEntity(e);
    }

    public List<EventResponseDTO> findAllEvents(String search, boolean includeInactive) {
        log.debug("Finding all events - Search: {}, Include inactive: {}", search, includeInactive);
        
        List<Event> events;
        if (search == null || search.isBlank()) {
            events = includeInactive ? repository.findAllByOrderByCreatedAtDesc() : repository.findByDeletedAtIsNullOrderByCreatedAtDesc();
        } else {
            String term = "%" + search.toLowerCase() + "%";
            events = includeInactive ?
                    repository.findBySearchTermIncludingInactiveOrderByCreatedAtDesc(term) :
                    repository.findBySearchTermAndDeletedAtIsNullOrderByCreatedAtDesc(term);
        }

        log.debug("Found {} events", events.size());
        return events.stream().map(EventResponseDTO::fromEntity).toList();
    }

    @Transactional
    public EventResponseDTO updateEvent(UUID id, EventRequestDTO request) {
        log.debug("Updating event [ID: {}] - Name: {}", id, request.name());
        
        Event e = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        e.setName(request.name());
        e.setDate(request.date());
        e.setStartTime(request.startTime());
        e.setEndTime(request.endTime());
        e.setLocation(request.location());
        e.setDescription(request.description());
        e.setTrainer(findTrainer(request.trainerId()));

        // Update participants if provided
        if (request.participantIds() != null) {
            log.debug("Updating participants for event [ID: {}] - {} participants", id, request.participantIds().size());
            updateEventParticipants(e, request.participantIds());
        }

        log.info("Event updated successfully [ID: {}] - Name: {}", id, e.getName());
        return EventResponseDTO.fromEntity(e);
    }

    @Transactional
    public EventResponseDTO patchEvent(UUID id, PatchEventRequestDTO request) {
        log.debug("Patching event [ID: {}]", id);
        
        Event e = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (request.name() != null) e.setName(request.name());
        if (request.date() != null) e.setDate(request.date());
        if (request.startTime() != null) e.setStartTime(request.startTime());
        if (request.endTime() != null) e.setEndTime(request.endTime());
        if (request.location() != null) e.setLocation(request.location());
        if (request.description() != null) e.setDescription(request.description());
        if (request.trainerId() != null) e.setTrainer(findTrainer(request.trainerId()));
        if (request.participantIds() != null) updateEventParticipants(e, request.participantIds());

        log.info("Event patched successfully [ID: {}] - Name: {}", id, e.getName());
        return EventResponseDTO.fromEntity(e);
    }

    @Transactional
    public void deleteEvent(UUID id) {
        log.debug("Deleting event [ID: {}]", id);
        
        Event e = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        
        log.info("Deactivating event [ID: {}] - Name: {}", id, e.getName());
        e.deactivate();
        repository.save(e);
        log.info("Event deleted successfully [ID: {}]", id);
    }

    @Transactional
    public EventResponseDTO restoreEvent(UUID id) {
        log.debug("Restoring event [ID: {}]", id);
        
        Event e = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (e.isActive()) {
            log.warn("Attempted to restore already active event [ID: {}]", id);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event is already active");
        }

        log.info("Activating event [ID: {}] - Name: {}", id, e.getName());
        e.activate();
        repository.save(e);
        log.info("Event restored successfully [ID: {}]", id);
        return EventResponseDTO.fromEntity(e);
    }

    private Trainer findTrainer(UUID trainerId) {
        if (trainerId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trainer is required");
        }
        return trainerRepository.findById(trainerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found"));
    }

    private void addParticipantsToEvent(Event event, List<UUID> participantIds) {
        for (UUID studentId : participantIds) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found: " + studentId));

            if (!participantRepository.existsByEventIdAndStudentId(event.getId(), studentId)) {
                EventParticipant participant = new EventParticipant(event, student);
                participantRepository.save(participant);
            }
        }
    }

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

    @Transactional
    public EventResponseDTO addParticipant(UUID eventId, UUID studentId) {
        log.debug("Adding participant [Student ID: {}] to event [ID: {}]", studentId, eventId);
        
        Event event = repository.findByIdAndDeletedAtIsNull(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        if (participantRepository.existsByEventIdAndStudentId(eventId, studentId)) {
            log.warn("Student [ID: {}] already enrolled in event [ID: {}]", studentId, eventId);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student already enrolled in this event");
        }

        EventParticipant participant = new EventParticipant(event, student);
        participantRepository.save(participant);
        
        log.info("Participant added successfully - Student: {} to Event [ID: {}]", student.getName(), eventId);
        return EventResponseDTO.fromEntity(repository.findById(eventId).orElseThrow());
    }

    @Transactional
    public void removeParticipant(UUID eventId, UUID studentId) {
        log.debug("Removing participant [Student ID: {}] from event [ID: {}]", studentId, eventId);
        
        if (!repository.existsByIdAndDeletedAtIsNull(eventId)) {
            log.warn("Attempted to remove participant from non-existent event [ID: {}]", eventId);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        }

        if (!participantRepository.existsByEventIdAndStudentId(eventId, studentId)) {
            log.warn("Attempted to remove non-enrolled student [ID: {}] from event [ID: {}]", studentId, eventId);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not enrolled in this event");
        }

        participantRepository.deleteByEventIdAndStudentId(eventId, studentId);
        log.info("Participant removed successfully - Student [ID: {}] from Event [ID: {}]", studentId, eventId);
    }

    @Transactional
    public EventResponseDTO toggleAttendance(UUID eventId, UUID studentId) {
        log.debug("Toggling attendance for participant [Student ID: {}] in event [ID: {}]", studentId, eventId);
        
        EventParticipant participant = participantRepository.findByEventIdAndStudentId(eventId, studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Participant not found"));

        boolean newAttendanceStatus = !participant.getPresent();
        participant.setPresent(newAttendanceStatus);
        participantRepository.save(participant);
        
        log.info("Attendance toggled successfully - Student [ID: {}] in Event [ID: {}] - Present: {}", 
                studentId, eventId, newAttendanceStatus);

        return EventResponseDTO.fromEntity(repository.findById(eventId).orElseThrow());
    }
}

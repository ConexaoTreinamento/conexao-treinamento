package org.conexaotreinamento.conexaotreinamentobackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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
public class EventService {

    private final EventRepository repository;
    private final EventParticipantRepository participantRepository;
    private final StudentRepository studentRepository;
    private final TrainerRepository trainerRepository;

    @Transactional
    public EventResponseDTO createEvent(EventRequestDTO request) {
        Event e = new Event(request.name(), request.date());
        e.setStartTime(request.startTime());
        e.setEndTime(request.endTime());
        e.setLocation(request.location());
        e.setDescription(request.description());
        e.setTrainer(findTrainer(request.trainerId()));

        Event saved = repository.save(e);

        // Add participants if provided
        if (request.participantIds() != null && !request.participantIds().isEmpty()) {
            addParticipantsToEvent(saved, request.participantIds());
        }

        return EventResponseDTO.fromEntity(repository.findById(saved.getId()).orElseThrow());
    }

    public EventResponseDTO findEventById(UUID id) {
        Event e = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        return EventResponseDTO.fromEntity(e);
    }

    public List<EventResponseDTO> findAllEvents(String search, boolean includeInactive) {
        List<Event> events;
        if (search == null || search.isBlank()) {
            events = includeInactive ? repository.findAllByOrderByCreatedAtDesc() : repository.findByDeletedAtIsNullOrderByCreatedAtDesc();
        } else {
            String term = "%" + search.toLowerCase() + "%";
            events = includeInactive ?
                    repository.findBySearchTermIncludingInactiveOrderByCreatedAtDesc(term) :
                    repository.findBySearchTermAndDeletedAtIsNullOrderByCreatedAtDesc(term);
        }

        return events.stream().map(EventResponseDTO::fromEntity).toList();
    }

    @Transactional
    public EventResponseDTO updateEvent(UUID id, EventRequestDTO request) {
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
            updateEventParticipants(e, request.participantIds());
        }

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
        if (request.trainerId() != null) e.setTrainer(findTrainer(request.trainerId()));
        if (request.participantIds() != null) updateEventParticipants(e, request.participantIds());

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
        Event event = repository.findByIdAndDeletedAtIsNull(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        if (participantRepository.existsByEventIdAndStudentId(eventId, studentId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student already enrolled in this event");
        }

        EventParticipant participant = new EventParticipant(event, student);
        participantRepository.save(participant);

        return EventResponseDTO.fromEntity(repository.findById(eventId).orElseThrow());
    }

    @Transactional
    public void removeParticipant(UUID eventId, UUID studentId) {
        if (!repository.existsByIdAndDeletedAtIsNull(eventId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        }

        if (!participantRepository.existsByEventIdAndStudentId(eventId, studentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not enrolled in this event");
        }

        participantRepository.deleteByEventIdAndStudentId(eventId, studentId);
    }

    @Transactional
    public EventResponseDTO toggleAttendance(UUID eventId, UUID studentId) {
        EventParticipant participant = participantRepository.findByEventIdAndStudentId(eventId, studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Participant not found"));

        participant.setPresent(!participant.getPresent());
        participantRepository.save(participant);

        return EventResponseDTO.fromEntity(repository.findById(eventId).orElseThrow());
    }
}

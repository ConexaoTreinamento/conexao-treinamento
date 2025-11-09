package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.EventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchEventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.EventResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentLookupResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerLookupResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.EventService;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentService;
import org.conexaotreinamento.conexaotreinamentobackend.service.TrainerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
@Slf4j
public class EventController {

    private final EventService eventService;
    private final StudentService studentService;
    private final TrainerService trainerService;

    @PostMapping
    public ResponseEntity<EventResponseDTO> createEvent(@RequestBody @Valid EventRequestDTO request) {
        log.info("Creating new event - Title: {}, Date: {}", request.name(), request.date());
        EventResponseDTO response = eventService.createEvent(request);
        log.info("Event created successfully [ID: {}] - Title: {}", response.id(), response.name());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> findEventById(@PathVariable UUID id) {
        log.debug("Fetching event by ID: {}", id);
        return ResponseEntity.ok(eventService.findEventById(id));
    }
    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> findAllEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        log.debug("Fetching all events - Search: {}, Include inactive: {}", search, includeInactive);
        List<EventResponseDTO> events = eventService.findAllEvents(search, includeInactive);
        log.debug("Retrieved {} events", events.size());
        return ResponseEntity.ok(events);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponseDTO> updateEvent(@PathVariable UUID id, @RequestBody @Valid EventRequestDTO request) {
        log.info("Updating event [ID: {}] - Title: {}", id, request.name());
        EventResponseDTO response = eventService.updateEvent(id, request);
        log.info("Event updated successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EventResponseDTO> patchEvent(@PathVariable UUID id, @RequestBody @Valid PatchEventRequestDTO request) {
        log.info("Patching event [ID: {}]", id);
        EventResponseDTO response = eventService.patchEvent(id, request);
        log.info("Event patched successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        log.info("Deleting event [ID: {}]", id);
        eventService.deleteEvent(id);
        log.info("Event deleted successfully [ID: {}]", id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<EventResponseDTO> restoreEvent(@PathVariable UUID id) {
        log.info("Restoring event [ID: {}]", id);
        EventResponseDTO response = eventService.restoreEvent(id);
        log.info("Event restored successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/participants/{studentId}")
    public ResponseEntity<EventResponseDTO> addParticipant(@PathVariable UUID id, @PathVariable UUID studentId) {
        log.info("Adding participant [Student ID: {}] to event [ID: {}]", studentId, id);
        EventResponseDTO response = eventService.addParticipant(id, studentId);
        log.info("Participant added successfully to event [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/participants/{studentId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable UUID id, @PathVariable UUID studentId) {
        log.info("Removing participant [Student ID: {}] from event [ID: {}]", studentId, id);
        eventService.removeParticipant(id, studentId);
        log.info("Participant removed successfully from event [ID: {}]", id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/participants/{studentId}/attendance")
    public ResponseEntity<EventResponseDTO> toggleAttendance(@PathVariable UUID id, @PathVariable UUID studentId) {
        log.info("Toggling attendance for participant [Student ID: {}] in event [ID: {}]", studentId, id);
        EventResponseDTO response = eventService.toggleAttendance(id, studentId);
        log.info("Attendance toggled successfully for event [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/lookup/students")
        
    public ResponseEntity<List<StudentLookupResponseDTO>> getStudentsForLookup() {
        log.debug("Fetching students for lookup");
        List<StudentLookupResponseDTO> students = studentService.findAllActive()
                .stream()
                .map(StudentLookupResponseDTO::fromEntity)
                .toList();
        log.debug("Retrieved {} students for lookup", students.size());
        return ResponseEntity.ok(students);
    }

    @GetMapping("/lookup/trainers")
    public ResponseEntity<List<TrainerLookupResponseDTO>> getTrainersForLookup() {
        log.debug("Fetching trainers for lookup");
        List<TrainerLookupResponseDTO> trainers = trainerService.findAll()
                .stream()
                .map(dto -> new TrainerLookupResponseDTO(dto.id(), "Prof. " + dto.name()))
                .toList();
        log.debug("Retrieved {} trainers for lookup", trainers.size());
        return ResponseEntity.ok(trainers);
    }
}

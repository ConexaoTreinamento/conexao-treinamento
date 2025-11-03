package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.EventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchEventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.EventResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentLookupDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerLookupDTO;
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

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final StudentService studentService;
    private final TrainerService trainerService;

    @PostMapping
    public ResponseEntity<EventResponseDTO> createEvent(@RequestBody @Valid EventRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(request));
    }

    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> findAllEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(eventService.findAllEvents(search, includeInactive));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponseDTO> findEventById(@PathVariable UUID eventId) {
        return ResponseEntity.ok(eventService.findEventById(eventId));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<EventResponseDTO> updateEvent(@PathVariable UUID eventId, @RequestBody @Valid EventRequestDTO request) {
        return ResponseEntity.ok(eventService.updateEvent(eventId, request));
    }

    @PatchMapping("/{eventId}")
    public ResponseEntity<EventResponseDTO> patchEvent(@PathVariable UUID eventId, @RequestBody @Valid PatchEventRequestDTO request) {
        return ResponseEntity.ok(eventService.patchEvent(eventId, request));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{eventId}/restore")
    public ResponseEntity<EventResponseDTO> restoreEvent(@PathVariable UUID eventId) {
        return ResponseEntity.ok(eventService.restoreEvent(eventId));
    }

    @PostMapping("/{eventId}/participants/{studentId}")
    public ResponseEntity<EventResponseDTO> addParticipant(@PathVariable UUID eventId, @PathVariable UUID studentId) {
        return ResponseEntity.ok(eventService.addParticipant(eventId, studentId));
    }

    @DeleteMapping("/{eventId}/participants/{studentId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable UUID eventId, @PathVariable UUID studentId) {
        eventService.removeParticipant(eventId, studentId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{eventId}/participants/{studentId}/attendance")
    public ResponseEntity<EventResponseDTO> toggleAttendance(@PathVariable UUID eventId, @PathVariable UUID studentId) {
        return ResponseEntity.ok(eventService.toggleAttendance(eventId, studentId));
    }

    @GetMapping("/lookup/students")
    public ResponseEntity<List<StudentLookupDTO>> getStudentsForLookup() {
        List<StudentLookupDTO> students = studentService.findAllActive()
                .stream()
                .map(StudentLookupDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/lookup/trainers")
    public ResponseEntity<List<TrainerLookupDTO>> getTrainersForLookup() {
        List<TrainerLookupDTO> trainers = trainerService.findAll()
                .stream()
                .map(dto -> new TrainerLookupDTO(dto.id(), "Prof. " + dto.name()))
                .toList();
        return ResponseEntity.ok(trainers);
    }
}

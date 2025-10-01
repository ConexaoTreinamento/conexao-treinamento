package org.conexaotreinamento.conexaotreinamentobackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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

    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> findEventById(@PathVariable UUID id) {
        return ResponseEntity.ok(eventService.findEventById(id));
    }

    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> findAllEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(eventService.findAllEvents(search, includeInactive));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponseDTO> updateEvent(@PathVariable UUID id, @RequestBody @Valid EventRequestDTO request) {
        return ResponseEntity.ok(eventService.updateEvent(id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EventResponseDTO> patchEvent(@PathVariable UUID id, @RequestBody @Valid PatchEventRequestDTO request) {
        return ResponseEntity.ok(eventService.patchEvent(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<EventResponseDTO> restoreEvent(@PathVariable UUID id) {
        return ResponseEntity.ok(eventService.restoreEvent(id));
    }

    @PostMapping("/{id}/participants/{studentId}")
    public ResponseEntity<EventResponseDTO> addParticipant(@PathVariable UUID id, @PathVariable UUID studentId) {
        return ResponseEntity.ok(eventService.addParticipant(id, studentId));
    }

    @DeleteMapping("/{id}/participants/{studentId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable UUID id, @PathVariable UUID studentId) {
        eventService.removeParticipant(id, studentId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/participants/{studentId}/attendance")
    public ResponseEntity<EventResponseDTO> toggleAttendance(@PathVariable UUID id, @PathVariable UUID studentId) {
        return ResponseEntity.ok(eventService.toggleAttendance(id, studentId));
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

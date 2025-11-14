package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.EventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchEventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.EventResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentLookupResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerLookupResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.EventService;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentService;
import org.conexaotreinamento.conexaotreinamentobackend.service.TrainerService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.ErrorResponse;
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
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST Controller for managing Events and their participants.
 */
@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Events", description = "Endpoints for managing events and participants")
public class EventController {

    private final EventService eventService;
    private final StudentService studentService;
    private final TrainerService trainerService;

    @PostMapping
    @Operation(summary = "Create new event", description = "Creates a new event with optional participants")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Event created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Trainer not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<EventResponseDTO> createEvent(
            @RequestBody @Valid EventRequestDTO request) {
        
        log.info("Creating new event - Title: {}, Date: {}", request.name(), request.date());
        EventResponseDTO response = eventService.createEvent(request);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        
        log.info("Event created successfully [ID: {}] - Title: {}", response.id(), response.name());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get event by ID", description = "Retrieves an event by its unique identifier")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Event found"),
        @ApiResponse(responseCode = "404", description = "Event not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<EventResponseDTO> findEventById(
            @PathVariable @Parameter(description = "Event ID") UUID id) {
        
        log.debug("Fetching event by ID: {}", id);
        return ResponseEntity.ok(eventService.findEventById(id));
    }

    @GetMapping
    @Operation(summary = "List all events", description = "Retrieves all events with optional search")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Events retrieved successfully")
    })
    public ResponseEntity<List<EventResponseDTO>> findAllEvents(
            @RequestParam(required = false) 
            @Parameter(description = "Search term for name/description") 
            String search,
            
            @RequestParam(required = false, defaultValue = "false")
            @Parameter(description = "Include soft-deleted events") 
            boolean includeInactive) {
        
        log.debug("Fetching all events - Search: {}, Include inactive: {}", search, includeInactive);
        List<EventResponseDTO> events = eventService.findAllEvents(search, includeInactive);
        log.debug("Retrieved {} events", events.size());
        return ResponseEntity.ok(events);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update event", description = "Updates an existing event")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Event updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Event or trainer not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<EventResponseDTO> updateEvent(
            @PathVariable @Parameter(description = "Event ID") UUID id,
            @RequestBody @Valid EventRequestDTO request) {
        
        log.info("Updating event [ID: {}] - Title: {}", id, request.name());
        EventResponseDTO response = eventService.updateEvent(id, request);
        log.info("Event updated successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Partially update event", description = "Partially updates an event with only provided fields")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Event patched successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Event not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<EventResponseDTO> patchEvent(
            @PathVariable @Parameter(description = "Event ID") UUID id,
            @RequestBody @Valid PatchEventRequestDTO request) {
        
        log.info("Patching event [ID: {}]", id);
        EventResponseDTO response = eventService.patchEvent(id, request);
        log.info("Event patched successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete event", description = "Soft deletes an event")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Event deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Event not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteEvent(
            @PathVariable @Parameter(description = "Event ID") UUID id) {
        
        log.info("Deleting event [ID: {}]", id);
        eventService.deleteEvent(id);
        log.info("Event deleted successfully [ID: {}]", id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    @Operation(summary = "Restore event", description = "Restores a soft-deleted event")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Event restored successfully"),
        @ApiResponse(responseCode = "400", description = "Event already active", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Event not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<EventResponseDTO> restoreEvent(
            @PathVariable @Parameter(description = "Event ID") UUID id) {
        
        log.info("Restoring event [ID: {}]", id);
        EventResponseDTO response = eventService.restoreEvent(id);
        log.info("Event restored successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/participants/{studentId}")
    @Operation(summary = "Add participant", description = "Adds a student as participant to an event")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Participant added successfully"),
        @ApiResponse(responseCode = "404", description = "Event or student not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Student already enrolled", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<EventResponseDTO> addParticipant(
            @PathVariable @Parameter(description = "Event ID") UUID id,
            @PathVariable @Parameter(description = "Student ID") UUID studentId) {
        
        log.info("Adding participant [Student ID: {}] to event [ID: {}]", studentId, id);
        EventResponseDTO response = eventService.addParticipant(id, studentId);
        log.info("Participant added successfully to event [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/participants/{studentId}")
    @Operation(summary = "Remove participant", description = "Removes a student from an event")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Participant removed successfully"),
        @ApiResponse(responseCode = "404", description = "Event or participant not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> removeParticipant(
            @PathVariable @Parameter(description = "Event ID") UUID id,
            @PathVariable @Parameter(description = "Student ID") UUID studentId) {
        
        log.info("Removing participant [Student ID: {}] from event [ID: {}]", studentId, id);
        eventService.removeParticipant(id, studentId);
        log.info("Participant removed successfully from event [ID: {}]", id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/participants/{studentId}/attendance")
    @Operation(summary = "Toggle attendance", description = "Toggles the attendance status of a participant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Attendance toggled successfully"),
        @ApiResponse(responseCode = "404", description = "Participant not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<EventResponseDTO> toggleAttendance(
            @PathVariable @Parameter(description = "Event ID") UUID id,
            @PathVariable @Parameter(description = "Student ID") UUID studentId) {
        
        log.info("Toggling attendance for participant [Student ID: {}] in event [ID: {}]", studentId, id);
        EventResponseDTO response = eventService.toggleAttendance(id, studentId);
        log.info("Attendance toggled successfully for event [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/lookup/students")
    @Operation(summary = "Get students for lookup", description = "Retrieves active students for event participant selection")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Students retrieved successfully")
    })
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
    @Operation(summary = "Get trainers for lookup", description = "Retrieves active trainers for event assignment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Trainers retrieved successfully")
    })
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

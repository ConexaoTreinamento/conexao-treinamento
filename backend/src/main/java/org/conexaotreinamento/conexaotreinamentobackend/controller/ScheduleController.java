package org.conexaotreinamento.conexaotreinamentobackend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.*;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ScheduleResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.SessionResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.ScheduleService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.ErrorResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

/**
 * REST controller for managing training schedules and sessions.
 * Handles session creation, participant management, and exercise tracking.
 */
@RestController
@RequestMapping("/schedule")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Schedule", description = "Training schedule and session management")
public class ScheduleController {
    
    private final ScheduleService scheduleService;
    
    @GetMapping
    @Operation(summary = "Get schedule", description = "Retrieves all scheduled sessions within a date range")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Schedule retrieved successfully")
    })
    public ResponseEntity<ScheduleResponseDTO> getSchedule(
            @RequestParam 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            @Parameter(description = "Start date", example = "2024-01-01")
            LocalDate startDate,
            
            @RequestParam 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            @Parameter(description = "End date", example = "2024-01-31")
            LocalDate endDate) {
        
        log.debug("Fetching schedule from {} to {}", startDate, endDate);
        return ResponseEntity.ok(new ScheduleResponseDTO(scheduleService.getScheduledSessions(startDate, endDate)));
    }
    
    @PostMapping("/sessions/{sessionId}")
    @Operation(summary = "Update session", description = "Updates session participants and/or notes")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Session updated successfully"),
        @ApiResponse(responseCode = "404", description = "Session not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> updateSession(
            @PathVariable @Parameter(description = "Session ID") String sessionId,
            @RequestBody @Parameter(description = "Session update request") SessionUpdateRequestDTO request) {
        
        log.info("Updating session [ID: {}]", sessionId);
        
        if (request.participants() != null) {
            scheduleService.updateSessionParticipants(sessionId, request.participants());
        }
        
        if (request.notes() != null) {
            scheduleService.updateSessionNotes(sessionId, request.notes());
        }
        
        log.info("Session updated successfully [ID: {}]", sessionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sessions/{sessionId}")
    @Operation(summary = "Get session", description = "Retrieves a specific session by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Session found"),
        @ApiResponse(responseCode = "404", description = "Session not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<SessionResponseDTO> getSession(
            @PathVariable @Parameter(description = "Session ID") String sessionId,
            @RequestParam(required = false) @Parameter(description = "Optional trainer ID filter") UUID trainerId) {
        
        log.debug("Finding session [ID: {}] for trainer [ID: {}]", sessionId, trainerId);
        return ResponseEntity.ok(scheduleService.getSessionById(sessionId, trainerId));
    }

    @PostMapping("/sessions/{sessionId}/trainer")
    @Operation(summary = "Update session trainer", description = "Updates the trainer assigned to a session")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Trainer updated successfully"),
        @ApiResponse(responseCode = "404", description = "Session or trainer not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> updateSessionTrainer(
            @PathVariable @Parameter(description = "Session ID") String sessionId,
            @RequestBody @Parameter(description = "Trainer update request") SessionTrainerUpdateRequestDTO req) {
        
        log.info("Updating trainer for session [ID: {}] to trainer [ID: {}]", sessionId, req.trainerId());
        scheduleService.updateSessionTrainer(sessionId, req.trainerId());
        log.info("Trainer updated successfully for session [ID: {}]", sessionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sessions/{sessionId}/cancel")
    @Operation(summary = "Cancel/restore session", description = "Cancels or restores a session")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Session status updated successfully"),
        @ApiResponse(responseCode = "404", description = "Session not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> cancelOrRestoreSession(
            @PathVariable @Parameter(description = "Session ID") String sessionId,
            @RequestBody @Parameter(description = "Cancel/restore request") SessionCancelRequestDTO req) {
        
        log.info("Updating session status [ID: {}] - Cancel: {}", sessionId, req.cancel());
        scheduleService.cancelOrRestoreSession(sessionId, req.cancel());
        log.info("Session status updated successfully [ID: {}]", sessionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sessions/{sessionId}/participants")
    @Operation(summary = "Add participant", description = "Adds a student participant to a session")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Participant added successfully"),
        @ApiResponse(responseCode = "404", description = "Session or student not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> addSessionParticipant(
            @PathVariable @Parameter(description = "Session ID") String sessionId,
            @RequestBody @Parameter(description = "Add participant request") SessionParticipantAddRequestDTO req) {
        
        log.info("Adding participant [Student ID: {}] to session [ID: {}]", req.studentId(), sessionId);
        scheduleService.addParticipant(sessionId, req.studentId());
        log.info("Participant added successfully to session [ID: {}]", sessionId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/sessions/{sessionId}/participants/{studentId}")
    @Operation(summary = "Remove participant", description = "Removes a student participant from a session")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Participant removed successfully"),
        @ApiResponse(responseCode = "404", description = "Session or participant not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> removeSessionParticipant(
            @PathVariable @Parameter(description = "Session ID") String sessionId,
            @PathVariable @Parameter(description = "Student ID") UUID studentId) {
        
        log.info("Removing participant [Student ID: {}] from session [ID: {}]", studentId, sessionId);
        scheduleService.removeParticipant(sessionId, studentId);
        log.info("Participant removed successfully from session [ID: {}]", sessionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sessions/{sessionId}/participants/{studentId}/presence")
    @Operation(summary = "Update presence", description = "Updates participant presence status for a session")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Presence updated successfully"),
        @ApiResponse(responseCode = "404", description = "Session or participant not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> updatePresence(
            @PathVariable @Parameter(description = "Session ID") String sessionId,
            @PathVariable @Parameter(description = "Student ID") UUID studentId,
            @RequestBody @Parameter(description = "Presence update request") SessionParticipantPresenceRequestDTO req) {
        
        log.info("Updating presence for participant [Student ID: {}] in session [ID: {}] - Present: {}", 
                studentId, sessionId, req.present());
        scheduleService.updateParticipantPresence(sessionId, studentId, req.present(), req.notes());
        log.info("Presence updated successfully");
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sessions/{sessionId}/participants/{studentId}/exercises")
    @Operation(summary = "Add participant exercise", description = "Adds an exercise record for a session participant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Exercise added successfully"),
        @ApiResponse(responseCode = "404", description = "Session or participant not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<UUID> addRegisteredParticipantExercise(
            @PathVariable @Parameter(description = "Session ID") String sessionId,
            @PathVariable @Parameter(description = "Student ID") UUID studentId,
            @RequestBody @Parameter(description = "Exercise creation request") ParticipantExerciseCreateRequestDTO req) {
        
        log.info("Adding exercise for participant [Student ID: {}] in session [ID: {}]", studentId, sessionId);
        UUID exerciseId = scheduleService.addParticipantExercise(sessionId, studentId, req).getId();
        log.info("Exercise added successfully [ID: {}]", exerciseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(exerciseId);
    }

    @PatchMapping("/sessions/participants/exercises/{exerciseRecordId}")
    @Operation(summary = "Update participant exercise", description = "Updates an exercise record for a session participant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Exercise updated successfully"),
        @ApiResponse(responseCode = "404", description = "Exercise record not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> updateRegisteredParticipantExercise(
            @PathVariable @Parameter(description = "Exercise record ID") UUID exerciseRecordId,
            @RequestBody @Parameter(description = "Exercise update request") ParticipantExerciseUpdateRequestDTO req) {
        
        log.info("Updating exercise record [ID: {}]", exerciseRecordId);
        scheduleService.updateParticipantExercise(exerciseRecordId, req);
        log.info("Exercise record updated successfully [ID: {}]", exerciseRecordId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/sessions/participants/exercises/{exerciseRecordId}")
    @Operation(summary = "Delete participant exercise", description = "Removes an exercise record from a session participant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Exercise removed successfully"),
        @ApiResponse(responseCode = "404", description = "Exercise record not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> removeRegisteredParticipantExercise(
            @PathVariable @Parameter(description = "Exercise record ID") UUID exerciseRecordId) {
        
        log.info("Removing exercise record [ID: {}]", exerciseRecordId);
        scheduleService.removeParticipantExercise(exerciseRecordId);
        log.info("Exercise record removed successfully [ID: {}]", exerciseRecordId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sessions/one-off")
    @Operation(summary = "Create one-off session", description = "Creates a single non-recurring training session")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Session created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<SessionResponseDTO> createOneOffSession(
            @RequestBody @Parameter(description = "One-off session creation request") OneOffSessionCreateRequestDTO req) {
        
        log.info("Creating one-off session");
        SessionResponseDTO session = scheduleService.createOneOffSession(req);
        log.info("One-off session created successfully [ID: {}]", session.sessionId());
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }
}

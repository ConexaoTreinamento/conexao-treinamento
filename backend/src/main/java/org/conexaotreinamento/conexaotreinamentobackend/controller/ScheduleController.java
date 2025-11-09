package org.conexaotreinamento.conexaotreinamentobackend.controller;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.*;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.MessageResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.SessionResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ScheduleResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

@RestController
public class ScheduleController {
    
    @Autowired
    private ScheduleService scheduleService;
    
    @GetMapping("/sessions")
    public ResponseEntity<ScheduleResponseDTO> getSchedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<SessionResponseDTO> sessions = scheduleService.getScheduledSessions(startDate, endDate);
        
        return ResponseEntity.ok(new ScheduleResponseDTO(sessions));
    }
    
    @PostMapping("/sessions")
    public ResponseEntity<SessionResponseDTO> createOneOffSession(@RequestBody OneOffSessionCreateRequestDTO req) {
        return ResponseEntity.ok(scheduleService.createOneOffSession(req));
    }
    
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<SessionResponseDTO> getSession(@PathVariable String sessionId, @RequestParam(required = false) UUID trainerId) {
        return ResponseEntity.ok(scheduleService.getSessionById(sessionId, trainerId));
    }
    
    @PatchMapping("/sessions/{sessionId}")
    public ResponseEntity<SessionResponseDTO> updateSession(
            @PathVariable String sessionId,
            @RequestBody SessionUpdateRequestDTO request) {
        
        if (request.participants() != null) {
            scheduleService.updateSessionParticipants(sessionId, request.participants());
        }
        
        if (request.notes() != null) {
            scheduleService.updateSessionNotes(sessionId, request.notes());
        }
        
        return ResponseEntity.ok(scheduleService.getSessionById(sessionId));
    }

    @PatchMapping("/sessions/{sessionId}/trainer")
    public ResponseEntity<SessionResponseDTO> updateSessionTrainer(@PathVariable String sessionId, @RequestBody SessionTrainerUpdateRequestDTO req) {
        scheduleService.updateSessionTrainer(sessionId, req.trainerId());
        return ResponseEntity.ok(scheduleService.getSessionById(sessionId));
    }

    @PatchMapping("/sessions/{sessionId}/cancel")
    public ResponseEntity<SessionResponseDTO> cancelOrRestoreSession(@PathVariable String sessionId, @RequestBody SessionCancelRequestDTO req) {
        scheduleService.cancelOrRestoreSession(sessionId, req.cancel());
        return ResponseEntity.ok(scheduleService.getSessionById(sessionId));
    }

    @PostMapping("/sessions/{sessionId}/participants")
    public ResponseEntity<MessageResponseDTO> addSessionParticipant(@PathVariable String sessionId, @RequestBody SessionParticipantAddRequestDTO req) {
        scheduleService.addParticipant(sessionId, req.studentId());
        return ResponseEntity.ok(new MessageResponseDTO("Participant added", true));
    }

    @DeleteMapping("/sessions/{sessionId}/participants/{studentId}")
    public ResponseEntity<Void> removeSessionParticipant(@PathVariable String sessionId, @PathVariable UUID studentId) {
        scheduleService.removeParticipant(sessionId, studentId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/sessions/{sessionId}/participants/{studentId}/presence")
    public ResponseEntity<MessageResponseDTO> updatePresence(@PathVariable String sessionId, @PathVariable UUID studentId, @RequestBody SessionParticipantPresenceRequestDTO req) {
        scheduleService.updateParticipantPresence(sessionId, studentId, req.present(), req.notes());
        return ResponseEntity.ok(new MessageResponseDTO("Presence updated", true));
    }

    @PostMapping("/sessions/{sessionId}/participants/{studentId}/exercises")
    public ResponseEntity<UUID> addRegisteredParticipantExercise(@PathVariable String sessionId, @PathVariable UUID studentId, @RequestBody ParticipantExerciseCreateRequestDTO req) {
        return ResponseEntity.ok(scheduleService.addParticipantExercise(sessionId, studentId, req).getId());
    }

    @PatchMapping("/sessions/participants/exercises/{exerciseRecordId}")
    public ResponseEntity<MessageResponseDTO> updateRegisteredParticipantExercise(@PathVariable UUID exerciseRecordId, @RequestBody ParticipantExerciseUpdateRequestDTO req) {
        scheduleService.updateParticipantExercise(exerciseRecordId, req);
        return ResponseEntity.ok(new MessageResponseDTO("Exercise updated", true));
    }

    @DeleteMapping("/sessions/participants/exercises/{exerciseRecordId}")
    public ResponseEntity<MessageResponseDTO> removeRegisteredParticipantExercise(@PathVariable UUID exerciseRecordId) {
        scheduleService.removeParticipantExercise(exerciseRecordId);
        return ResponseEntity.ok(new MessageResponseDTO("Exercise removed", true));
    }
}

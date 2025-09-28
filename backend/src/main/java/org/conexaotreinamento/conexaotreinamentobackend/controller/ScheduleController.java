package org.conexaotreinamento.conexaotreinamentobackend.controller;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.*;
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
@RequestMapping("/schedule")
public class ScheduleController {
    
    @Autowired
    private ScheduleService scheduleService;
    
    @GetMapping
    public ResponseEntity<ScheduleResponseDTO> getSchedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<SessionResponseDTO> sessions = scheduleService.getScheduledSessions(startDate, endDate);
        
        return ResponseEntity.ok(new ScheduleResponseDTO(sessions));
    }
    
    @PostMapping("/sessions/{sessionId}")
    public ResponseEntity<String> updateSession(
            @PathVariable String sessionId,
            @RequestBody SessionUpdateRequestDTO request) {
        
        if (request.getParticipants() != null) {
            scheduleService.updateSessionParticipants(sessionId, request.getParticipants());
        }
        
        if (request.getNotes() != null) {
            scheduleService.updateSessionNotes(sessionId, request.getNotes());
        }
        
        return ResponseEntity.ok("Session updated successfully");
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<SessionResponseDTO> getSession(@PathVariable String sessionId, @RequestParam(required = false) UUID trainerId) {
        return ResponseEntity.ok(scheduleService.getSessionById(sessionId, trainerId));
    }

    @PostMapping("/sessions/{sessionId}/trainer")
    public ResponseEntity<String> updateTrainer(@PathVariable String sessionId, @RequestBody SessionTrainerUpdateRequestDTO req) {
        scheduleService.updateSessionTrainer(sessionId, req.getTrainerId());
        return ResponseEntity.ok("Trainer updated");
    }

    @PostMapping("/sessions/{sessionId}/cancel")
    public ResponseEntity<String> cancelOrRestore(@PathVariable String sessionId, @RequestBody SessionCancelRequestDTO req) {
        scheduleService.cancelOrRestoreSession(sessionId, req.isCancel());
        return ResponseEntity.ok("Session status updated");
    }

    @PostMapping("/sessions/{sessionId}/participants")
    public ResponseEntity<String> addParticipant(@PathVariable String sessionId, @RequestBody SessionParticipantAddRequestDTO req) {
        scheduleService.addParticipant(sessionId, req.getStudentId());
        return ResponseEntity.ok("Participant added");
    }

    @DeleteMapping("/sessions/{sessionId}/participants/{studentId}")
    public ResponseEntity<String> removeParticipant(@PathVariable String sessionId, @PathVariable java.util.UUID studentId) {
        scheduleService.removeParticipant(sessionId, studentId);
        return ResponseEntity.ok("Participant removed");
    }

    @PostMapping("/sessions/{sessionId}/participants/{studentId}/presence")
    public ResponseEntity<String> updatePresence(@PathVariable String sessionId, @PathVariable java.util.UUID studentId, @RequestBody SessionParticipantPresenceRequestDTO req) {
        scheduleService.updateParticipantPresence(sessionId, studentId, req.isPresent(), req.getNotes());
        return ResponseEntity.ok("Presence updated");
    }

    @PostMapping("/sessions/{sessionId}/participants/{studentId}/exercises")
    public ResponseEntity<java.util.UUID> addExercise(@PathVariable String sessionId, @PathVariable java.util.UUID studentId, @RequestBody ParticipantExerciseCreateRequestDTO req) {
        return ResponseEntity.ok(scheduleService.addParticipantExercise(sessionId, studentId, req).getId());
    }

    @PatchMapping("/sessions/participants/exercises/{exerciseRecordId}")
    public ResponseEntity<String> updateExercise(@PathVariable java.util.UUID exerciseRecordId, @RequestBody ParticipantExerciseUpdateRequestDTO req) {
        scheduleService.updateParticipantExercise(exerciseRecordId, req);
        return ResponseEntity.ok("Exercise updated");
    }

    @DeleteMapping("/sessions/participants/exercises/{exerciseRecordId}")
    public ResponseEntity<String> removeExercise(@PathVariable java.util.UUID exerciseRecordId) {
        scheduleService.removeParticipantExercise(exerciseRecordId);
        return ResponseEntity.ok("Exercise removed");
    }

    @PostMapping("/sessions/one-off")
    public ResponseEntity<SessionResponseDTO> createOneOff(@RequestBody OneOffSessionCreateRequestDTO req) {
        return ResponseEntity.ok(scheduleService.createOneOffSession(req));
    }
}

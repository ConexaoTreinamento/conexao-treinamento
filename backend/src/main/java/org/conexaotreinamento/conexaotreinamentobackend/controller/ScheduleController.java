package org.conexaotreinamento.conexaotreinamentobackend.controller;

import jakarta.validation.Valid;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ScheduledSessionRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.SessionUpdateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerScheduleRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.EnrollmentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.WeekSplitRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ScheduleResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ScheduledSessionResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerScheduleResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.SessionParticipantResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.ScheduledSession;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.entity.SessionParticipant;
import org.conexaotreinamento.conexaotreinamentobackend.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {
    
    @Autowired
    private ScheduleService scheduleService;
    
    @GetMapping
    public ResponseEntity<ScheduleResponseDTO> getSchedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<ScheduledSession> sessions = scheduleService.getScheduledSessions(startDate, endDate);
        
        return ResponseEntity.ok(new ScheduleResponseDTO(sessions));
    }
    
    @GetMapping("/series")
    public ResponseEntity<List<TrainerScheduleResponseDTO>> getSeries(@RequestParam(required = false) UUID trainerId) {
        List<TrainerSchedule> series = scheduleService.findAllSeries(trainerId);
        List<TrainerScheduleResponseDTO> dtos = series.stream().map(this::mapToTrainerScheduleResponseDTO).toList();
        return ResponseEntity.ok(dtos);
    }
    
    @PostMapping("/series")
    public ResponseEntity<TrainerScheduleResponseDTO> createSeries(@Valid @RequestBody TrainerScheduleRequestDTO request) {
        TrainerSchedule created = scheduleService.createTrainerSchedule(mapToTrainerScheduleEntity(request));
        // Return 200 OK to align with generated client expectations
        return ResponseEntity.ok(mapToTrainerScheduleResponseDTO(created));
    }
    
    @PostMapping("/one-off")
    public ResponseEntity<ScheduledSessionResponseDTO> createOneOffSession(@Valid @RequestBody ScheduledSessionRequestDTO request) {
        ScheduledSession session = scheduleService.createOneOffSession(mapToEntity(request));
        // Return 200 OK to align with generated client expectations
        return ResponseEntity.ok(mapToResponseDTO(session));
    }
    
    @PutMapping("/series/{seriesId}")
    public ResponseEntity<TrainerScheduleResponseDTO> updateSchedule(
            @PathVariable UUID seriesId,
            @Valid @RequestBody TrainerScheduleRequestDTO request,
            @RequestParam Instant newEffectiveFrom) {
        
        // Ensure the provided path seriesId is applied to the mapped entity so the service
        // can perform the "this and following" split by updating the existing series' effectiveTo.
        TrainerSchedule entity = mapToTrainerScheduleEntity(request);
        entity.setId(seriesId);
        TrainerSchedule updated = scheduleService.updateSchedule(entity, newEffectiveFrom);
        return ResponseEntity.ok(mapToTrainerScheduleResponseDTO(updated));
    }

    @PostMapping("/series/split-week")
    public ResponseEntity<List<TrainerScheduleResponseDTO>> splitWeek(@Valid @RequestBody WeekSplitRequestDTO request) {
        List<TrainerSchedule> created = scheduleService.splitWeek(
            request.getTrainerId(),
            request.getNewEffectiveFrom(),
            request.getSeriesName(),
            request.getIntervalDuration(),
            request.getDays()
        );
        return ResponseEntity.ok(created.stream().map(this::mapToTrainerScheduleResponseDTO).toList());
    }

    public static class DeactivateWeekdaysRequest {
        public UUID trainerId;
        public List<Integer> weekdays;
    }

    @PostMapping("/series/deactivate-weekdays")
    public ResponseEntity<List<TrainerScheduleResponseDTO>> deactivateWeekdays(@RequestBody DeactivateWeekdaysRequest request) {
        if (request == null || request.trainerId == null || request.weekdays == null || request.weekdays.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<TrainerSchedule> updated = scheduleService.deactivateCurrentWeekdays(request.trainerId, request.weekdays);
        return ResponseEntity.ok(updated.stream().map(this::mapToTrainerScheduleResponseDTO).toList());
    }
    
    // Legacy update for compatibility
    @PostMapping("/sessions/{sessionId}")
    public ResponseEntity<String> updateSession(
            @PathVariable String sessionId,
            @RequestBody SessionUpdateRequestDTO request) {

        if (request.getParticipants() != null) {
            scheduleService.updateSessionParticipants(sessionId, request.getParticipants());
        }

        // Persist override fields (notes, trainer, capacity, cancellation, room/equipment) via diff
        scheduleService.updateSessionOverrides(sessionId, request);

        return ResponseEntity.ok("Session updated successfully");
    }
    
    // Enroll a student into multiple sessions (persist enrollments)
    @PostMapping("/enrollments")
    public ResponseEntity<String> enrollStudent(@Valid @RequestBody EnrollmentRequestDTO request) {
        scheduleService.enrollStudentToSessions(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("Enrollments saved");
    }
    
    // Helper mapping methods (implement as needed)
    private ScheduledSession mapToEntity(ScheduledSessionRequestDTO dto) {
        ScheduledSession entity = new ScheduledSession();
        entity.setSessionSeriesId(dto.getSessionSeriesId());
        entity.setTrainerId(dto.getTrainerId());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setMaxParticipants(dto.getMaxParticipants());
        entity.setSeriesName(dto.getSeriesName());
        entity.setNotes(dto.getNotes());
        entity.setRoom(dto.getRoom());
        entity.setEquipment(dto.getEquipment());
        entity.setInstanceOverride(dto.isInstanceOverride());
        entity.setEffectiveFromTimestamp(dto.getEffectiveFromTimestamp());
        // Persist explicit diff when provided so callers can send nulls to clear inherited values
        entity.setDiff(dto.getDiff());
        return entity;
    }
    
    private TrainerSchedule mapToTrainerScheduleEntity(TrainerScheduleRequestDTO dto) {
        TrainerSchedule entity = new TrainerSchedule();
        entity.setTrainerId(dto.getTrainerId());
        entity.setWeekday(dto.getWeekday());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setIntervalDuration(dto.getIntervalDuration());
        entity.setSeriesName(dto.getSeriesName());
        entity.setEffectiveFromTimestamp(dto.getEffectiveFromTimestamp());
        entity.setActive(true);
        return entity;
    }
    
    private ScheduledSessionResponseDTO mapToResponseDTO(ScheduledSession entity) {
        ScheduledSessionResponseDTO dto = new ScheduledSessionResponseDTO();
        dto.setId(entity.getId());
        dto.setSessionSeriesId(entity.getSessionSeriesId());
        dto.setSessionId(entity.getSessionId());
        dto.setTrainerId(entity.getTrainerId());
        dto.setTrainerName(entity.getTrainer() != null ? entity.getTrainer().getName() : null);
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setMaxParticipants(entity.getMaxParticipants());
        dto.setSeriesName(entity.getSeriesName());
        dto.setNotes(entity.getNotes());
        dto.setRoom(entity.getRoom());
        dto.setEquipment(entity.getEquipment());
        dto.setInstanceOverride(entity.isInstanceOverride());
        dto.setEffectiveFromTimestamp(entity.getEffectiveFromTimestamp());
        dto.setParticipants(entity.getParticipants() != null ? entity.getParticipants().stream().map(p -> {
            SessionParticipantResponseDTO pr = new SessionParticipantResponseDTO();
            pr.setId(p.getId());
            pr.setStudentId(p.getStudentId());
            pr.setStudentName(p.getStudent() != null ? p.getStudent().getName() : null);
            pr.setParticipationType(p.getParticipationType() == SessionParticipant.ParticipationType.INCLUDED ? SessionParticipantResponseDTO.ParticipationType.INCLUDED : SessionParticipantResponseDTO.ParticipationType.EXCLUDED);
            pr.setPresent(p.isPresent());
            pr.setAttendanceNotes(p.getAttendanceNotes());
            // exercises mapping omitted for lightweight response
            pr.setExercises(null);
            return pr;
        }).toList() : null);
        return dto;
    }
    
    private TrainerScheduleResponseDTO mapToTrainerScheduleResponseDTO(TrainerSchedule entity) {
        TrainerScheduleResponseDTO dto = new TrainerScheduleResponseDTO();
        dto.setId(entity.getId());
        dto.setTrainerId(entity.getTrainerId());
        dto.setTrainerName(entity.getTrainer() != null ? entity.getTrainer().getName() : null);
        dto.setWeekday(entity.getWeekday());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setIntervalDuration(entity.getIntervalDuration());
        dto.setSeriesName(entity.getSeriesName());
        dto.setEffectiveFromTimestamp(entity.getEffectiveFromTimestamp());
        dto.setEffectiveToTimestamp(entity.getEffectiveToTimestamp());
        dto.setActive(entity.isActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}

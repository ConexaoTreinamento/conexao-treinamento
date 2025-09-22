package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.entity.*;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.EnrollmentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.repository.ScheduledSessionRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanAssignmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanRepository;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScheduleService {
    
    private final TrainerScheduleRepository trainerScheduleRepository;
    private final ScheduledSessionRepository scheduledSessionRepository;
    private final StudentPlanAssignmentRepository planAssignmentRepository;
    private final StudentPlanRepository studentPlanRepository;
    
    @Autowired
    public ScheduleService(TrainerScheduleRepository trainerScheduleRepository, 
                           ScheduledSessionRepository scheduledSessionRepository,
                           StudentPlanAssignmentRepository planAssignmentRepository,
                           StudentPlanRepository studentPlanRepository) {
        this.trainerScheduleRepository = trainerScheduleRepository;
        this.scheduledSessionRepository = scheduledSessionRepository;
        this.planAssignmentRepository = planAssignmentRepository;
        this.studentPlanRepository = studentPlanRepository;
    }
    
    public List<ScheduledSession> getScheduledSessions(LocalDate startDate, LocalDate endDate) {
        Instant now = Instant.now();
        List<ScheduledSession> sessions = new ArrayList<>();
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            
            // Find all active trainer schedules effective at now for this day of week
            int weekday = date.getDayOfWeek() == DayOfWeek.SUNDAY ? 0 : date.getDayOfWeek().getValue();
            List<TrainerSchedule> daySchedules = trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampBeforeAndActive(
                weekday, now, true);
            
            // Create merged scheduled sessions for each schedule (lazy materialization with diffs)
            for (TrainerSchedule schedule : daySchedules) {
                Optional<ScheduledSession> overrideOpt = scheduledSessionRepository.findBySessionSeriesIdAndStartTime(
                    schedule.getId(), LocalDateTime.of(date, schedule.getStartTime()));
                
                sessions.add(merge(schedule, overrideOpt, date));
            }
        }
        
        return sessions.stream()
            .sorted(Comparator.comparing(ScheduledSession::getStartTime))
            .collect(Collectors.toList());
    }
    
    private String generateSessionId(TrainerSchedule schedule, LocalDate date) {
        return String.format("%s-%s-%s", 
            schedule.getSeriesName().toLowerCase().replace(" ", "-"),
            date.toString(),
            schedule.getStartTime().toString()
        );
    }
    
    private ScheduledSession merge(TrainerSchedule schedule, Optional<ScheduledSession> overrideOpt, LocalDate date) {
        ScheduledSession override = overrideOpt.orElse(null);
        ScheduledSession merged = new ScheduledSession();
        merged.setId(UUID.randomUUID()); // Virtual ID for virtual
        merged.setSessionSeriesId(schedule.getId());
        merged.setSessionId(generateSessionId(schedule, date));
        LocalDateTime startTime = LocalDateTime.of(date, schedule.getStartTime());
        LocalDateTime endTime = LocalDateTime.of(date, schedule.getEndTime());
        merged.setStartTime(startTime);
        merged.setEndTime(endTime);
        
        // Merge trainerId: override if set (including null for no trainer), else schedule
        if (override != null) {
            merged.setTrainerId(override.getTrainerId());
        } else {
            merged.setTrainerId(schedule.getTrainerId());
        }
        
        // Merge maxParticipants: override if set, else schedule or default
        if (override != null && override.getMaxParticipants() != null) {
            merged.setMaxParticipants(override.getMaxParticipants());
        } else if (schedule.getMaxParticipants() != null) {
            merged.setMaxParticipants(schedule.getMaxParticipants());
        } else {
            merged.setMaxParticipants(10);
        }
        
        // Merge seriesName: override if set, else schedule
        if (override != null && override.getSeriesName() != null) {
            merged.setSeriesName(override.getSeriesName());
        } else {
            merged.setSeriesName(schedule.getSeriesName());
        }
        
        // Merge notes: override if set, else null
        if (override != null && override.getNotes() != null) {
            merged.setNotes(override.getNotes());
        } else {
            merged.setNotes(null);
        }
        
        // Merge room: override if set, else null
        if (override != null && override.getRoom() != null) {
            merged.setRoom(override.getRoom());
        } else {
            merged.setRoom(null);
        }
        
        // Merge equipment: override if set, else null
        if (override != null && override.getEquipment() != null) {
            merged.setEquipment(override.getEquipment());
        } else {
            merged.setEquipment(null);
        }
        
        merged.setInstanceOverride(override != null);
        merged.setEffectiveFromTimestamp(Instant.now());
        
        return merged;
    }
    
    // Example method for creating one-off session (persist)
    public ScheduledSession createOneOffSession(ScheduledSession session) {
        session.setInstanceOverride(true);
        session.setEffectiveFromTimestamp(Instant.now());
        return scheduledSessionRepository.save(session);
    }
    
    // Method for updating schedule (temporal split)
    public TrainerSchedule updateSchedule(TrainerSchedule updatedSchedule, Instant newEffectiveFrom) {
        // Create new schedule for future
        TrainerSchedule newSchedule = new TrainerSchedule();
        // Copy fields from updated
        newSchedule.setTrainerId(updatedSchedule.getTrainerId());
        newSchedule.setWeekday(updatedSchedule.getWeekday());
        newSchedule.setStartTime(updatedSchedule.getStartTime());
        newSchedule.setEndTime(updatedSchedule.getEndTime());
        newSchedule.setIntervalDuration(updatedSchedule.getIntervalDuration());
        newSchedule.setSeriesName(updatedSchedule.getSeriesName());
        newSchedule.setEffectiveFromTimestamp(newEffectiveFrom);
        newSchedule.setActive(true);
        
        TrainerSchedule savedNew = trainerScheduleRepository.save(newSchedule);
        
        // Update old effective_to if needed (add field if not)
        // For now, old remains effective until manual end
        
        return savedNew;
    }
    
    public void updateSessionParticipants(String sessionId, List<SessionParticipant> participants) {
        Optional<ScheduledSession> optSession = scheduledSessionRepository.findBySessionId(sessionId);
        ScheduledSession session = optSession.orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));
        session.setInstanceOverride(true);
        for (SessionParticipant participant : participants) {
            participant.setScheduledSession(session);
        }
        session.setParticipants(participants);
        scheduledSessionRepository.save(session);
    }
    
    public void updateSessionNotes(String sessionId, String notes) {
        Optional<ScheduledSession> optSession = scheduledSessionRepository.findBySessionId(sessionId);
        ScheduledSession session = optSession.orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));
        session.setNotes(notes);
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
    }

    /**
     * Persist student enrollments for a set of session descriptors.
     * Creates a persisted session override when the sessionId does not exist yet.
     */
    public void enrollStudentToSessions(EnrollmentRequestDTO request) {
        if (request == null || request.getSessions() == null || request.getSessions().isEmpty()) return;

        UUID studentId = request.getStudentId();

        // Resolve current active plan assignment for student
        List<StudentPlanAssignment> currentAssignments = planAssignmentRepository.findCurrentActiveAssignment(studentId);
        if (currentAssignments == null || currentAssignments.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student has no active plan assignment");
        }
        StudentPlanAssignment assignment = currentAssignments.get(0);

        // Resolve plan and its limits
        StudentPlan plan = studentPlanRepository.findByIdAndActiveTrue(assignment.getPlanId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigned plan not found"));

        int maxDays = plan.getMaxDays(); // primitive in entity, always present
 
        // Compute existing enrollments within assignment window
        LocalDateTime startRange = LocalDateTime.ofInstant(assignment.getEffectiveFromTimestamp(), ZoneId.systemDefault());
        LocalDateTime endRange = LocalDateTime.ofInstant(assignment.getEffectiveToTimestamp(), ZoneId.systemDefault());
 
        long existingEnrollments = scheduledSessionRepository.countSessionsWithParticipantInRange(studentId, startRange, endRange);

        // Count unique new session ids in this request
        Set<String> newSessionIds = new HashSet<>();
        for (EnrollmentRequestDTO.EnrollmentSessionDTO s : request.getSessions()) {
            newSessionIds.add(s.getSessionId());
        }
        long newEnrollments = newSessionIds.size();

        if (existingEnrollments + newEnrollments > maxDays) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Plan limit exceeded for student: maxDays=" + maxDays + " (existing=" + existingEnrollments + ", requested=" + newEnrollments + ")");
        }

        // Proceed with enrollment persistence (same behavior as before)
        for (EnrollmentRequestDTO.EnrollmentSessionDTO s : request.getSessions()) {
            Optional<ScheduledSession> opt = scheduledSessionRepository.findBySessionId(s.getSessionId());
            ScheduledSession session;
            if (opt.isPresent()) {
                session = opt.get();
            } else {
                // Create a persisted override for this specific session
                session = new ScheduledSession();
                session.setSessionSeriesId(s.getSessionSeriesId());
                session.setSessionId(s.getSessionId());
                session.setTrainerId(s.getTrainerId());
                session.setStartTime(s.getStartTime());
                session.setEndTime(s.getEndTime());
                session.setMaxParticipants(s.getMaxParticipants());
                session.setSeriesName(s.getSeriesName());
                session.setInstanceOverride(true);
                session.setEffectiveFromTimestamp(Instant.now());
            }

            // Create participant entry
            SessionParticipant participant = new SessionParticipant();
            participant.setStudentId(request.getStudentId());
            participant.setParticipationType(SessionParticipant.ParticipationType.INCLUDED);
            participant.setPresent(false);
            participant.setScheduledSession(session);

            List<SessionParticipant> participants = session.getParticipants();
            if (participants == null) {
                participants = new ArrayList<>();
            }
            participants.add(participant);
            session.setParticipants(participants);

            scheduledSessionRepository.save(session);
        }
    }
}

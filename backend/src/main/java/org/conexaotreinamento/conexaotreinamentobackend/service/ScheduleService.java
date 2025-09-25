package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.SessionResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ExerciseResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentCommitmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.*;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScheduleService {
    
    @Autowired
    private TrainerScheduleRepository trainerScheduleRepository;
    
    @Autowired
    private ScheduledSessionRepository scheduledSessionRepository;
    
    @Autowired
    private SessionParticipantRepository sessionParticipantRepository;
    
    @Autowired
    private StudentCommitmentRepository studentCommitmentRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private TrainerRepository trainerRepository;
    
    public List<SessionResponseDTO> getScheduledSessions(LocalDate startDate, LocalDate endDate) {
        List<SessionResponseDTO> sessions = new ArrayList<>();
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        // First, check for existing scheduled session instances
        List<ScheduledSession> existingSessions = scheduledSessionRepository
            .findByStartTimeBetweenAndActiveTrue(startDateTime, endDateTime);
        
        // Create a map to track which dates/schedules already have instances
        Map<String, ScheduledSession> existingSessionMap = existingSessions.stream()
            .collect(Collectors.toMap(ScheduledSession::getSessionId, s -> s));
        
        // Generate sessions from trainer schedules for all dates in range
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            int weekday = date.getDayOfWeek() == DayOfWeek.SUNDAY ? 0 : date.getDayOfWeek().getValue();
            Instant sessionInstant = date.atStartOfDay().toInstant(ZoneOffset.UTC);
            
            // Get all active schedules for this weekday at this point in time
            List<TrainerSchedule> daySchedules = trainerScheduleRepository
                .findByWeekdayAndEffectiveFromTimestampLessThanEqual(weekday, sessionInstant);
            
            for (TrainerSchedule schedule : daySchedules) {
                String sessionId = generateSessionId(schedule, date);
                LocalDateTime sessionStartTime = LocalDateTime.of(date, schedule.getStartTime());
                LocalDateTime sessionEndTime = LocalDateTime.of(date, schedule.getEndTime());
                
                // Check if there's an existing session instance
                ScheduledSession existingSession = existingSessionMap.get(sessionId);
                
                // Create session DTO
                SessionResponseDTO session = new SessionResponseDTO();
                session.setSessionId(sessionId);
                session.setTrainerId(schedule.getTrainerId());
                session.setStartTime(sessionStartTime);
                session.setEndTime(sessionEndTime);
                session.setSeriesName(schedule.getSeriesName());
                
                // Set trainer name
                trainerRepository.findById(schedule.getTrainerId())
                    .ifPresent(trainer -> session.setTrainerName(trainer.getName()));
                
                // Set instance-specific data if exists
                if (existingSession != null) {
                    session.setNotes(existingSession.getNotes());
                    session.setInstanceOverride(existingSession.isInstanceOverride());
                } else {
                    session.setInstanceOverride(false);
                }
                
                // Get student commitments for this session series at this point in time
                List<StudentCommitmentResponseDTO> studentCommitments = getStudentCommitmentsForSession(
                    schedule.getId(), sessionInstant, existingSession);
                session.setStudents(studentCommitments);
                
                sessions.add(session);
            }
        }
        
        return sessions.stream()
            .sorted(Comparator.comparing(SessionResponseDTO::getStartTime))
            .collect(Collectors.toList());
    }
    
    
    public void updateSessionParticipants(String sessionId, List<SessionParticipant> participants) {
        // Create or update scheduled session instance
        ScheduledSession session = getOrCreateSessionInstance(sessionId);
        
        // Clear existing participants
        List<SessionParticipant> existing = sessionParticipantRepository
            .findByScheduledSession_IdAndActiveTrue(session.getId());
        existing.forEach(p -> {
            p.softDelete();
            sessionParticipantRepository.save(p);
        });
        
        // Add new participants
        for (SessionParticipant participant : participants) {
            participant.setScheduledSession(session);
            sessionParticipantRepository.save(participant);
        }
        
        // Mark session as having overrides
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
    }
    
    public void updateSessionNotes(String sessionId, String notes) {
        ScheduledSession session = getOrCreateSessionInstance(sessionId);
        session.setNotes(notes);
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
    }
    
    private String generateSessionId(TrainerSchedule schedule, LocalDate date) {
        return String.format("%s-%s-%s", 
            schedule.getSeriesName().toLowerCase().replace(" ", "-"),
            date.toString(),
            schedule.getStartTime().toString()
        );
    }
    
    private ScheduledSession generateSessionFromSchedule(TrainerSchedule schedule, LocalDate date) {
        ScheduledSession session = new ScheduledSession();
        session.setId(UUID.randomUUID());
        session.setSessionSeriesId(schedule.getId());
        session.setSessionId(generateSessionId(schedule, date));
        session.setTrainerId(schedule.getTrainerId());
        session.setStartTime(LocalDateTime.of(date, schedule.getStartTime()));
        session.setEndTime(LocalDateTime.of(date, schedule.getEndTime()));
        session.setMaxParticipants(10); // Default value
        session.setSeriesName(schedule.getSeriesName());
        session.setInstanceOverride(false); // Generated from schedule, no overrides
        session.setEffectiveFromTimestamp(Instant.now());
        return session;
    }
    
    private ScheduledSession getOrCreateSessionInstance(String sessionId) {
        return scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)
            .orElseGet(() -> {
                // Parse sessionId to extract date and find the schedule
                String[] parts = sessionId.split("-");
                if (parts.length >= 4) {
                    try {
                        LocalDate date = LocalDate.parse(parts[1] + "-" + parts[2] + "-" + parts[3]);
                        LocalTime time = LocalTime.parse(parts[4]);
                        int weekday = date.getDayOfWeek() == DayOfWeek.SUNDAY ? 0 : date.getDayOfWeek().getValue();
                        
                        // Find the schedule that matches
                        List<TrainerSchedule> schedules = trainerScheduleRepository
                            .findByWeekdayAndEffectiveFromTimestampLessThanEqual(weekday, date.atStartOfDay().toInstant(java.time.ZoneOffset.UTC));
                        
                        for (TrainerSchedule schedule : schedules) {
                            if (schedule.getStartTime().equals(time) && generateSessionId(schedule, date).equals(sessionId)) {
                                ScheduledSession session = generateSessionFromSchedule(schedule, date);
                                return scheduledSessionRepository.save(session);
                            }
                        }
                    } catch (Exception e) {
                        // If parsing fails, create a basic session
                    }
                }
                throw new RuntimeException("Could not create session instance for sessionId: " + sessionId);
            });
    }
    
    private List<StudentCommitmentResponseDTO> getStudentCommitmentsForSession(UUID sessionSeriesId, Instant sessionInstant, ScheduledSession existingSession) {
        List<StudentCommitmentResponseDTO> studentCommitments = new ArrayList<>();
        
        // Get all commitments for this session series
        List<StudentCommitment> allCommitments = studentCommitmentRepository.findBySessionSeriesId(sessionSeriesId);
        
        // Group by student to get the most recent commitment for each student at session time
        Map<UUID, StudentCommitment> latestCommitmentsPerStudent = new HashMap<>();
        
        for (StudentCommitment commitment : allCommitments) {
            if (commitment.getEffectiveFromTimestamp().isBefore(sessionInstant) || 
                commitment.getEffectiveFromTimestamp().equals(sessionInstant)) {
                
                UUID studentId = commitment.getStudentId();
                StudentCommitment existing = latestCommitmentsPerStudent.get(studentId);
                
                if (existing == null || commitment.getEffectiveFromTimestamp().isAfter(existing.getEffectiveFromTimestamp())) {
                    latestCommitmentsPerStudent.put(studentId, commitment);
                }
            }
        }
        
        // Convert to DTOs and include exercise data if available
        for (StudentCommitment commitment : latestCommitmentsPerStudent.values()) {
            StudentCommitmentResponseDTO dto = new StudentCommitmentResponseDTO();
            dto.setStudentId(commitment.getStudentId());
            dto.setCommitmentStatus(commitment.getCommitmentStatus());
            
            // Get student name
            studentRepository.findById(commitment.getStudentId())
                .ifPresent(student -> dto.setStudentName(student.getName()));
            
            // Get exercises if this session has been materialized and student has exercises
            List<ExerciseResponseDTO> exercises = new ArrayList<>();
            if (existingSession != null) {
                List<SessionParticipant> participants = sessionParticipantRepository
                    .findByScheduledSession_IdAndStudentIdAndActiveTrue(existingSession.getId(), commitment.getStudentId());
                
                for (SessionParticipant participant : participants) {
                    if (participant.getExercises() != null) {
                        for (ParticipantExercise participantExercise : participant.getExercises()) {
                            if (participantExercise.getExercise() != null) {
                                ExerciseResponseDTO exerciseDto = ExerciseResponseDTO.fromEntity(participantExercise.getExercise());
                                exercises.add(exerciseDto);
                            }
                        }
                    }
                }
            }
            dto.setExercises(exercises);
            
            studentCommitments.add(dto);
        }
        
        return studentCommitments;
    }
    
}

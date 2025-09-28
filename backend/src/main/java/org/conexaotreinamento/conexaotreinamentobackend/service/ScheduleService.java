package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.SessionResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.*;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ExerciseResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ParticipantExerciseResponseDTO;
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

    @Autowired
    private ParticipantExerciseRepository participantExerciseRepository;
    
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
                    session.setCanceled(existingSession.isCanceled());
                    session.setMaxParticipants(existingSession.getMaxParticipants());
                } else {
                    session.setInstanceOverride(false);
                    session.setCanceled(false);
                    session.setMaxParticipants(schedule.getIntervalDuration()); // temporary placeholder for capacity mapping
                }
                
                // Get student commitments for this session series at this point in time
                List<StudentCommitmentResponseDTO> studentCommitments = getStudentCommitmentsForSession(
                    schedule.getId(), sessionInstant, existingSession);
                session.setStudents(studentCommitments);
                session.setPresentCount((int) studentCommitments.stream().filter(sc -> sc.getCommitmentStatus() == CommitmentStatus.ATTENDING).count());
                
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

    public SessionResponseDTO getSessionById(String sessionId) {
        ScheduledSession sessionEntity = getOrCreateSessionInstance(sessionId);
        // derive date for commitments
        LocalDate date = sessionEntity.getStartTime().toLocalDate();
        Instant sessionInstant = date.atStartOfDay().toInstant(ZoneOffset.UTC);
        SessionResponseDTO dto = new SessionResponseDTO();
        dto.setSessionId(sessionEntity.getSessionId());
        dto.setTrainerId(sessionEntity.getTrainerId());
        if (sessionEntity.getTrainerId() != null) {
            trainerRepository.findById(sessionEntity.getTrainerId()).ifPresent(t -> dto.setTrainerName(t.getName()));
        }
        dto.setStartTime(sessionEntity.getStartTime());
        dto.setEndTime(sessionEntity.getEndTime());
        dto.setSeriesName(sessionEntity.getSeriesName());
        dto.setNotes(sessionEntity.getNotes());
        dto.setInstanceOverride(sessionEntity.isInstanceOverride());
        dto.setCanceled(sessionEntity.isCanceled());
        dto.setMaxParticipants(sessionEntity.getMaxParticipants());
        // commitments + participants info
        List<StudentCommitmentResponseDTO> students = getStudentCommitmentsForSession(sessionEntity.getSessionSeriesId(), sessionInstant, sessionEntity);
        dto.setStudents(students);
        dto.setPresentCount((int) students.stream().filter(sc -> sc.getCommitmentStatus() == CommitmentStatus.ATTENDING).count());
        return dto;
    }

    public void updateSessionTrainer(String sessionId, UUID trainerId) {
        ScheduledSession session = getOrCreateSessionInstance(sessionId);
        session.setTrainerId(trainerId);
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
    }

    public void cancelOrRestoreSession(String sessionId, boolean cancel) {
        ScheduledSession session = getOrCreateSessionInstance(sessionId);
        session.setCanceled(cancel);
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
    }

    public void addParticipant(String sessionId, UUID studentId) {
        ScheduledSession session = getOrCreateSessionInstance(sessionId);
        SessionParticipant participant = new SessionParticipant();
        participant.setScheduledSession(session);
        participant.setStudentId(studentId);
        participant.setParticipationType(SessionParticipant.ParticipationType.INCLUDED);
        sessionParticipantRepository.save(participant);
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
    }

    public void removeParticipant(String sessionId, UUID studentId) {
        ScheduledSession session = getOrCreateSessionInstance(sessionId);
        List<SessionParticipant> participants = sessionParticipantRepository
            .findByScheduledSession_IdAndStudentIdAndActiveTrue(session.getId(), studentId);
        participants.forEach(p -> { p.softDelete(); sessionParticipantRepository.save(p); });
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
    }

    public void updateParticipantPresence(String sessionId, UUID studentId, boolean present, String notes) {
        ScheduledSession session = getOrCreateSessionInstance(sessionId);
        List<SessionParticipant> participants = sessionParticipantRepository
            .findByScheduledSession_IdAndStudentIdAndActiveTrue(session.getId(), studentId);
        if (participants.isEmpty()) {
            addParticipant(sessionId, studentId);
            participants = sessionParticipantRepository
                .findByScheduledSession_IdAndStudentIdAndActiveTrue(session.getId(), studentId);
        }
        for (SessionParticipant participant : participants) {
            participant.setPresent(present);
            participant.setAttendanceNotes(notes);
            participant.updateTimestamp();
            sessionParticipantRepository.save(participant);
        }
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
    }

    public ParticipantExercise addParticipantExercise(String sessionId, UUID studentId, ParticipantExerciseCreateRequestDTO req) {
        ScheduledSession session = getOrCreateSessionInstance(sessionId);
        List<SessionParticipant> participants = sessionParticipantRepository
            .findByScheduledSession_IdAndStudentIdAndActiveTrue(session.getId(), studentId);
        if (participants.isEmpty()) {
            addParticipant(sessionId, studentId);
            participants = sessionParticipantRepository
                .findByScheduledSession_IdAndStudentIdAndActiveTrue(session.getId(), studentId);
        }
        SessionParticipant participant = participants.get(0);
        ParticipantExercise pe = new ParticipantExercise();
        pe.setSessionParticipant(participant);
        pe.setExerciseId(req.getExerciseId());
        pe.setSetsCompleted(req.getSetsCompleted());
        pe.setRepsCompleted(req.getRepsCompleted());
        pe.setWeightCompleted(req.getWeightCompleted());
        pe.setExerciseNotes(req.getExerciseNotes());
        participantExerciseRepository.save(pe);
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
        return pe;
    }

    public void updateParticipantExercise(UUID exerciseRecordId, ParticipantExerciseUpdateRequestDTO req) {
        participantExerciseRepository.findById(exerciseRecordId).ifPresent(pe -> {
            if (req.getSetsCompleted() != null) pe.setSetsCompleted(req.getSetsCompleted());
            if (req.getRepsCompleted() != null) pe.setRepsCompleted(req.getRepsCompleted());
            if (req.getWeightCompleted() != null) pe.setWeightCompleted(req.getWeightCompleted());
            if (req.getExerciseNotes() != null) pe.setExerciseNotes(req.getExerciseNotes());
            pe.updateTimestamp();
            participantExerciseRepository.save(pe);
        });
    }

    public void removeParticipantExercise(UUID exerciseRecordId) {
        participantExerciseRepository.findById(exerciseRecordId).ifPresent(pe -> {
            pe.softDelete();
            participantExerciseRepository.save(pe);
        });
    }

    public SessionResponseDTO createOneOffSession(OneOffSessionCreateRequestDTO req) {
        ScheduledSession session = new ScheduledSession();
        session.setId(UUID.randomUUID());
        session.setSessionSeriesId(UUID.randomUUID()); // standalone series id
        session.setSessionId(String.format("oneoff__%s__%s", req.getStartTime().toLocalDate(), req.getStartTime().toLocalTime()));
        session.setTrainerId(req.getTrainerId());
        session.setStartTime(req.getStartTime());
        session.setEndTime(req.getEndTime());
        session.setMaxParticipants(req.getMaxParticipants() != null ? req.getMaxParticipants() : 10);
        session.setSeriesName(req.getSeriesName());
        session.setInstanceOverride(true);
        session.setEffectiveFromTimestamp(Instant.now());
        session.setNotes(req.getNotes());
        scheduledSessionRepository.save(session);
        return getSessionById(session.getSessionId());
    }
    
    private String generateSessionId(TrainerSchedule schedule, LocalDate date) {
        return String.format("%s__%s__%s",
            schedule.getSeriesName().toLowerCase().replace(" ", "-"),
            date.toString(),
            schedule.getStartTime().toString()
        );
    }
    
    private ScheduledSession generateSessionFromSchedule(TrainerSchedule schedule, LocalDate date) {
        ScheduledSession session = new ScheduledSession();
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
                String[] parts = sessionId.split("__");
                if (parts.length == 3) {
                    try {
                        String dateStr = parts[1];
                        String timeStr = parts[2];
                        LocalDate date = LocalDate.parse(dateStr);
                        LocalTime time = LocalTime.parse(timeStr);
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
                        // Fallback: slug may have changed (series renamed).
                        List<TrainerSchedule> timeMatches = schedules.stream()
                            .filter(s -> s.getStartTime().equals(time))
                            .toList();
                        if (!timeMatches.isEmpty()) {
                            if (timeMatches.size() == 1) {
                                TrainerSchedule schedule = timeMatches.get(0);
                                ScheduledSession session = generateSessionFromSchedule(schedule, date);
                                return scheduledSessionRepository.save(session);
                            } else {
                                // Disambiguate using provided slug (parts[0]) heuristics
                                String providedSlug = parts[0].toLowerCase();
                                List<TrainerSchedule> exactSlugMatches = timeMatches.stream()
                                    .filter(s -> s.getSeriesName() != null && s.getSeriesName().toLowerCase().replace(" ", "-").equals(providedSlug))
                                    .toList();
                                if (exactSlugMatches.size() == 1) {
                                    ScheduledSession session = generateSessionFromSchedule(exactSlugMatches.get(0), date);
                                    return scheduledSessionRepository.save(session);
                                }
                                // Prefix / contains heuristics
                                List<TrainerSchedule> prefixMatches = timeMatches.stream()
                                    .filter(s -> {
                                        String slug = s.getSeriesName() == null ? "" : s.getSeriesName().toLowerCase().replace(" ", "-");
                                        return slug.startsWith(providedSlug) || providedSlug.startsWith(slug);
                                    }).toList();
                                if (prefixMatches.size() == 1) {
                                    ScheduledSession session = generateSessionFromSchedule(prefixMatches.get(0), date);
                                    return scheduledSessionRepository.save(session);
                                }
                                // Still ambiguous: throw with diagnostic
                                String candidates = timeMatches.stream()
                                    .map(s -> generateSessionId(s, date))
                                    .distinct()
                                    .reduce((a,b) -> a + "," + b).orElse("(none)");
                                throw new RuntimeException("Ambiguous session slug/time. Provided='" + sessionId + "' candidates=" + candidates);
                            }
                        }
                    } catch (Exception e) {
                        // Parsing failed
                        throw new RuntimeException("Could not create session instance for sessionId: " + sessionId, e);
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
            List<ParticipantExerciseResponseDTO> participantExerciseDtos = new ArrayList<>();
            if (existingSession != null) {
                List<SessionParticipant> participants = sessionParticipantRepository
                        .findByScheduledSession_IdAndStudentIdAndActiveTrue(existingSession.getId(), commitment.getStudentId());
                for (SessionParticipant participant : participants) {
                    // attendance flags
                    dto.setPresent(participant.isPresent());
                    if (participant.getAttendanceNotes() != null) {
                        dto.setAttendanceNotes(participant.getAttendanceNotes());
                    }
                    if (participant.getExercises() != null) {
                        for (ParticipantExercise participantExercise : participant.getExercises()) {
                            if (participantExercise.isActive()) {
                                if (participantExercise.getExercise() != null) {
                                    ExerciseResponseDTO exerciseDto = ExerciseResponseDTO.fromEntity(participantExercise.getExercise());
                                    exercises.add(exerciseDto);
                                }
                                participantExerciseDtos.add(new ParticipantExerciseResponseDTO(
                                        participantExercise.getId(),
                                        participantExercise.getExerciseId(),
                                        participantExercise.getExercise() != null ? participantExercise.getExercise().getName() : null,
                                        participantExercise.getSetsCompleted(),
                                        participantExercise.getRepsCompleted(),
                                        participantExercise.getWeightCompleted(),
                                        participantExercise.getExerciseNotes()
                                ));
                            }
                        }
                    }
                }
            }
            dto.setExercises(exercises);
            dto.setParticipantExercises(participantExerciseDtos);
            
            studentCommitments.add(dto);
        }
        
        return studentCommitments;
    }
    
}

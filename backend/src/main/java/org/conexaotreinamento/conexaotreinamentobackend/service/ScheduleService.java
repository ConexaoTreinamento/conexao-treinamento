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
            .findByStartTimeBetweenAndIsActiveTrue(startDateTime, endDateTime);
        
        // Create a map to track which dates/schedules already have instances
        // Map by both the persisted sessionId (legacy 3-part or new 4-part) AND the canonical 4-part key
        Map<String, ScheduledSession> existingSessionMap = new HashMap<>();
        for (ScheduledSession ss : existingSessions) {
            // Persisted key
            existingSessionMap.put(ss.getSessionId(), ss);
            // Canonical key (series/date/time/trainer)
            String canonicalKey = generateSessionId(ss.getSeriesName(),
                    ss.getStartTime() != null ? ss.getStartTime().toLocalDate() : null,
                    ss.getStartTime() != null ? ss.getStartTime().toLocalTime() : null,
                    ss.getTrainerId());
            if (canonicalKey != null) {
                existingSessionMap.putIfAbsent(canonicalKey, ss);
            }
        }
        // Track generated (virtual) sessionIds to avoid duplicates when also adding standalone instances
        Set<String> generatedSessionIds = new HashSet<>();
        
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
                LocalDateTime sessionEndTime = LocalDateTime.of(date, schedule.calculateEndTime());
                
                // Check if there's an existing session instance (canonical 4-part); fallback to legacy 3-part
                ScheduledSession existingSession = existingSessionMap.get(sessionId);
                if (existingSession == null) {
                    String legacyId = generateLegacySessionId(schedule, date);
                    if (legacyId != null) existingSession = existingSessionMap.get(legacyId);
                }
                generatedSessionIds.add(sessionId);
                // Also track legacy key to avoid duplicates later
                String legacyGeneratedId = generateLegacySessionId(schedule, date);
                if (legacyGeneratedId != null) generatedSessionIds.add(legacyGeneratedId);
                
                UUID trainerId = schedule.getTrainerId();
                String trainerName = null;
                if (trainerId != null) {
                    trainerName = trainerRepository.findById(trainerId)
                        .map(trainer -> trainer.getName())
                        .orElse(null);
                }
                String notes = existingSession != null ? existingSession.getNotes() : null;
                boolean instanceOverride = existingSession != null && existingSession.isInstanceOverride();
                boolean canceled = existingSession != null && existingSession.isCanceled();

                List<StudentCommitmentResponseDTO> studentCommitments = getStudentCommitmentsForSession(
                    schedule.getId(), sessionInstant, existingSession);
                int presentCount = (int) studentCommitments.stream()
                    .filter(sc -> sc.commitmentStatus() == CommitmentStatus.ATTENDING)
                    .count();

                sessions.add(new SessionResponseDTO(
                    sessionId,
                    trainerId,
                    trainerName,
                    sessionStartTime,
                    sessionEndTime,
                    schedule.getSeriesName(),
                    notes,
                    instanceOverride,
                    studentCommitments,
                    canceled,
                    presentCount
                ));
            }
        }
        // Also include any standalone persisted sessions that do not correspond to a generated schedule (e.g., one-offs)
        for (ScheduledSession ss : existingSessions) {
            // If an existing persisted session corresponds to a generated session, skip it to avoid duplicates.
            String altId = generateSessionId(ss.getSeriesName(),
                    ss.getStartTime() != null ? ss.getStartTime().toLocalDate() : null,
                    ss.getStartTime() != null ? ss.getStartTime().toLocalTime() : null,
                    ss.getTrainerId());
            String altLegacy = null;
            if (ss.getStartTime() != null) {
                altLegacy = String.format("%s__%s__%s", safeSlug(ss.getSeriesName()), ss.getStartTime().toLocalDate(), ss.getStartTime().toLocalTime());
            }
            if (!generatedSessionIds.contains(ss.getSessionId())
                    && (altId == null || !generatedSessionIds.contains(altId))
                    && (altLegacy == null || !generatedSessionIds.contains(altLegacy))) {
                LocalDate date = ss.getStartTime().toLocalDate();
                Instant sessionInstant = date.atStartOfDay().toInstant(ZoneOffset.UTC);
                UUID trainerId = ss.getTrainerId();
                String trainerName = null;
                if (trainerId != null) {
                    trainerName = trainerRepository.findById(trainerId)
                        .map(trainer -> trainer.getName())
                        .orElse(null);
                }
                List<StudentCommitmentResponseDTO> students = getStudentCommitmentsForSession(ss.getSessionSeriesId(), sessionInstant, ss);
                int presentCount = (int) students.stream()
                    .filter(sc -> sc.commitmentStatus() == CommitmentStatus.ATTENDING)
                    .count();

                sessions.add(new SessionResponseDTO(
                    ss.getSessionId(),
                    trainerId,
                    trainerName,
                    ss.getStartTime(),
                    ss.getEndTime(),
                    ss.getSeriesName(),
                    ss.getNotes(),
                    ss.isInstanceOverride(),
                    students,
                    ss.isCanceled(),
                    presentCount
                ));
            }
        }
        
        return sessions.stream()
            .sorted(Comparator.comparing(SessionResponseDTO::startTime))
            .collect(Collectors.toList());
    }
    
    
    public void updateSessionParticipants(String sessionId, List<SessionParticipant> participants) {
        // Create or update scheduled session instance
        ScheduledSession session = getOrCreateSessionInstance(sessionId);
        
        // Clear existing participants
        List<SessionParticipant> existing = sessionParticipantRepository
            .findByScheduledSession_IdAndIsActiveTrue(session.getId());
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
        return getSessionById(sessionId, null);
    }

    public SessionResponseDTO getSessionById(String sessionId, UUID preferredTrainerId) {
        // 1) If an instance already exists, return it
        Optional<ScheduledSession> existingOpt = scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId);
        if (existingOpt.isPresent()) {
            ScheduledSession sessionEntity = existingOpt.get();
            LocalDate date = sessionEntity.getStartTime().toLocalDate();
            Instant sessionInstant = date.atStartOfDay().toInstant(ZoneOffset.UTC);
            UUID trainerId = sessionEntity.getTrainerId();
            String trainerName = null;
            if (trainerId != null) {
                trainerName = trainerRepository.findById(trainerId)
                    .map(trainer -> trainer.getName())
                    .orElse(null);
            }
            List<StudentCommitmentResponseDTO> students = getStudentCommitmentsForSession(sessionEntity.getSessionSeriesId(), sessionInstant, sessionEntity);
            int presentCount = (int) students.stream()
                .filter(sc -> sc.commitmentStatus() == CommitmentStatus.ATTENDING)
                .count();

            return new SessionResponseDTO(
                sessionEntity.getSessionId(),
                trainerId,
                trainerName,
                sessionEntity.getStartTime(),
                sessionEntity.getEndTime(),
                sessionEntity.getSeriesName(),
                sessionEntity.getNotes(),
                sessionEntity.isInstanceOverride(),
                students,
                sessionEntity.isCanceled(),
                presentCount
            );
        }

        // 2) Lazily resolve from schedule without materializing an instance
        String[] parts = sessionId.split("__");
        if (parts.length < 3 || parts.length > 4) {
            throw new RuntimeException("Invalid sessionId format: " + sessionId);
        }
        try {
            String dateStr = parts[1];
            String timeStr = parts[2];
            // Optional provided trainerId (4th part) to help disambiguation
            final UUID providedTrainerId = (parts.length == 4 && parts[3] != null && !parts[3].isBlank() && !"null".equalsIgnoreCase(parts[3]))
                    ? safeParseUUID(parts[3])
                    : null;
            LocalDate date = LocalDate.parse(dateStr);
            LocalTime time = LocalTime.parse(timeStr);
            int weekday = date.getDayOfWeek() == DayOfWeek.SUNDAY ? 0 : date.getDayOfWeek().getValue();
            Instant sessionInstant = date.atStartOfDay().toInstant(ZoneOffset.UTC);
            // If multiple persisted instances exist for this timestamp (edge), prefer one matching trainer override
            List<ScheduledSession> persistedSameStart = scheduledSessionRepository
                .findByStartTimeBetweenAndIsActiveTrue(LocalDateTime.of(date, time), LocalDateTime.of(date, time));
            if (!persistedSameStart.isEmpty()) {
                UUID trainerPref = preferredTrainerId != null ? preferredTrainerId : providedTrainerId;
                if (trainerPref != null) {
                    for (ScheduledSession ss : persistedSameStart) {
                        if (trainerPref.equals(ss.getTrainerId())) {
                            return getSessionById(ss.getSessionId());
                        }
                    }
                }
                // Otherwise return the first (stable choice)
                return getSessionById(persistedSameStart.get(0).getSessionId());
            }
            List<TrainerSchedule> schedules = trainerScheduleRepository
                .findByWeekdayAndEffectiveFromTimestampLessThanEqual(weekday, sessionInstant);
            // Try exact canonical match first
            for (TrainerSchedule schedule : schedules) {
                String canonical = generateSessionId(schedule, date);
                // Also accept legacy 3-part id for backward compatibility
                String legacy = generateLegacySessionId(schedule, date);
                if (schedule.getStartTime().equals(time) && (canonical.equals(sessionId) || legacy.equals(sessionId))) {
                    return buildVirtualSessionDTO(schedule, date, sessionInstant);
                }
            }
            // Fallback heuristics (slug rename, etc.)
            List<TrainerSchedule> timeMatches = schedules.stream()
                .filter(s -> s.getStartTime().equals(time))
                .toList();
            if (!timeMatches.isEmpty()) {
                // Strong disambiguation: trainerId if provided
                UUID trainerPref = preferredTrainerId != null ? preferredTrainerId : providedTrainerId;
                if (trainerPref != null) {
                    List<TrainerSchedule> trainerMatches = timeMatches.stream()
                        .filter(s -> trainerPref.equals(s.getTrainerId()))
                        .toList();
                    if (trainerMatches.size() == 1) {
                        return buildVirtualSessionDTO(trainerMatches.get(0), date, sessionInstant);
                    }
                }
                if (timeMatches.size() == 1) {
                    return buildVirtualSessionDTO(timeMatches.get(0), date, sessionInstant);
                } else {
                    String providedSlug = parts[0].toLowerCase();
                    List<TrainerSchedule> exactSlugMatches = timeMatches.stream()
                        .filter(s -> s.getSeriesName() != null && s.getSeriesName().toLowerCase().replace(" ", "-").equals(providedSlug))
                        .toList();
                    if (exactSlugMatches.size() == 1) {
                        return buildVirtualSessionDTO(exactSlugMatches.get(0), date, sessionInstant);
                    }
                    List<TrainerSchedule> prefixMatches = timeMatches.stream()
                        .filter(s -> {
                            String slug = s.getSeriesName() == null ? "" : s.getSeriesName().toLowerCase().replace(" ", "-");
                            return slug.startsWith(providedSlug) || providedSlug.startsWith(slug);
                        }).toList();
                    if (prefixMatches.size() == 1) {
                        return buildVirtualSessionDTO(prefixMatches.get(0), date, sessionInstant);
                    }
                    String candidates = timeMatches.stream()
                        .map(s -> generateSessionId(s, date))
                        .distinct()
                        .reduce((a,b) -> a + "," + b).orElse("(none)");
                    throw new RuntimeException("Ambiguous session slug/time. Provided='" + sessionId + "' candidates=" + candidates);
                }
            }
            throw new RuntimeException("Could not resolve session for sessionId: " + sessionId);
        } catch (Exception e) {
            throw new RuntimeException("Could not resolve session for sessionId: " + sessionId, e);
        }
    }

    private SessionResponseDTO buildVirtualSessionDTO(TrainerSchedule schedule, LocalDate date, Instant sessionInstant) {
        String sessionId = generateSessionId(schedule, date);
        UUID trainerId = schedule.getTrainerId();
        String trainerName = null;
        if (trainerId != null) {
            trainerName = trainerRepository.findById(trainerId)
                .map(trainer -> trainer.getName())
                .orElse(null);
        }
        LocalDateTime startTime = LocalDateTime.of(date, schedule.getStartTime());
        LocalDateTime endTime = LocalDateTime.of(date, schedule.calculateEndTime());
        List<StudentCommitmentResponseDTO> students = getStudentCommitmentsForSession(schedule.getId(), sessionInstant, null);
        int presentCount = (int) students.stream()
            .filter(sc -> sc.commitmentStatus() == CommitmentStatus.ATTENDING)
            .count();

        return new SessionResponseDTO(
            sessionId,
            trainerId,
            trainerName,
            startTime,
            endTime,
            schedule.getSeriesName(),
            null,
            false,
            students,
            false,
            presentCount
        );
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
        // If there is an EXCLUDED override for this student in this instance, remove it
        List<SessionParticipant> existing = sessionParticipantRepository
            .findByScheduledSession_IdAndStudentIdAndIsActiveTrue(session.getId(), studentId);
        for (SessionParticipant sp : existing) {
            if (sp.isExcluded()) {
                sessionParticipantRepository.delete(sp);
            }
        }
        // Create INCLUDED override (or keep existing INCLUDED)
        boolean hasIncluded = existing.stream().anyMatch(SessionParticipant::isIncluded);
        if (!hasIncluded) {
            SessionParticipant participant = new SessionParticipant();
            participant.setScheduledSession(session);
            participant.setStudentId(studentId);
            participant.setParticipationType(SessionParticipant.ParticipationType.INCLUDED);
            sessionParticipantRepository.save(participant);
        }
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
    }

    public void removeParticipant(String sessionId, UUID studentId) {
        ScheduledSession session = getOrCreateSessionInstance(sessionId);
        List<SessionParticipant> existing = sessionParticipantRepository
            .findByScheduledSession_IdAndStudentIdAndIsActiveTrue(session.getId(), studentId);
        // Remove any INCLUDED overrides
        existing.stream().filter(SessionParticipant::isIncluded).forEach(sessionParticipantRepository::delete);
        // Add EXCLUDED override if not already present
        boolean hasExcluded = existing.stream().anyMatch(SessionParticipant::isExcluded);
        if (!hasExcluded) {
            SessionParticipant ex = new SessionParticipant();
            ex.setScheduledSession(session);
            ex.setStudentId(studentId);
            ex.setParticipationType(SessionParticipant.ParticipationType.EXCLUDED);
            sessionParticipantRepository.save(ex);
        }
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
    }

    public void updateParticipantPresence(String sessionId, UUID studentId, boolean present, String notes) {
        ScheduledSession session = getOrCreateSessionInstance(sessionId);
        List<SessionParticipant> participants = sessionParticipantRepository
            .findByScheduledSession_IdAndStudentIdAndIsActiveTrue(session.getId(), studentId);
        // If there is an EXCLUDED override, remove it since we are explicitly setting presence
        participants.stream().filter(SessionParticipant::isExcluded).forEach(sessionParticipantRepository::delete);
        if (participants.stream().noneMatch(SessionParticipant::isIncluded)) {
            addParticipant(sessionId, studentId);
            participants = sessionParticipantRepository
                .findByScheduledSession_IdAndStudentIdAndIsActiveTrue(session.getId(), studentId);
        }
        for (SessionParticipant participant : participants) {
            if (participant.isIncluded()) {
                participant.setPresent(present);
                participant.setAttendanceNotes(notes);
                participant.updateTimestamp();
                sessionParticipantRepository.save(participant);
            }
        }
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
    }

    public ParticipantExercise addParticipantExercise(String sessionId, UUID studentId, ParticipantExerciseCreateRequestDTO req) {
        ScheduledSession session = getOrCreateSessionInstance(sessionId);
        List<SessionParticipant> participants = sessionParticipantRepository
            .findByScheduledSession_IdAndStudentIdAndIsActiveTrue(session.getId(), studentId);
        if (participants.isEmpty()) {
            addParticipant(sessionId, studentId);
            participants = sessionParticipantRepository
                .findByScheduledSession_IdAndStudentIdAndIsActiveTrue(session.getId(), studentId);
        }
        SessionParticipant participant = participants.get(0);
        ParticipantExercise pe = new ParticipantExercise();
        pe.setSessionParticipant(participant);
        pe.setExerciseId(req.exerciseId());
        pe.setSetsCompleted(req.setsCompleted());
        pe.setRepsCompleted(req.repsCompleted());
        pe.setWeightCompleted(req.weightCompleted());
        pe.setExerciseNotes(req.exerciseNotes());
        if (req.done() != null) pe.setDone(req.done());
        participantExerciseRepository.save(pe);
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
        return pe;
    }

    public void updateParticipantExercise(UUID exerciseRecordId, ParticipantExerciseUpdateRequestDTO req) {
        participantExerciseRepository.findById(exerciseRecordId).ifPresent(pe -> {
            if (req.setsCompleted() != null) pe.setSetsCompleted(req.setsCompleted());
            if (req.repsCompleted() != null) pe.setRepsCompleted(req.repsCompleted());
            if (req.weightCompleted() != null) pe.setWeightCompleted(req.weightCompleted());
            if (req.exerciseNotes() != null) pe.setExerciseNotes(req.exerciseNotes());
            if (req.done() != null) pe.setDone(req.done());
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
        session.setSessionSeriesId(null); // standalone series id
        session.setSessionId(String.format("oneoff__%s__%s", req.startTime().toLocalDate(), req.startTime().toLocalTime()));
        session.setTrainerId(req.trainerId());
        session.setStartTime(req.startTime());
        session.setEndTime(req.endTime());
        session.setSeriesName(req.seriesName());
        session.setInstanceOverride(true);
        session.setEffectiveFromTimestamp(Instant.now());
        session.setNotes(req.notes());
        scheduledSessionRepository.save(session);
        return getSessionById(session.getSessionId());
    }
    
    private String generateSessionId(TrainerSchedule schedule, LocalDate date) {
        if (schedule == null || date == null) return null;
        return generateSessionId(schedule.getSeriesName(), date, schedule.getStartTime(), schedule.getTrainerId());
    }

    // Legacy 3-part id retained for compatibility checks
    private String generateLegacySessionId(TrainerSchedule schedule, LocalDate date) {
        if (schedule == null || date == null) return null;
        return String.format("%s__%s__%s",
                safeSlug(schedule.getSeriesName()),
                date,
                schedule.getStartTime());
    }

    // Canonical generator that includes the trainerId to avoid collisions between trainers at same time
    private String generateSessionId(String seriesName, LocalDate date, LocalTime startTime, UUID trainerId) {
        if (date == null || startTime == null) return null;
        String slug = safeSlug(seriesName);
        String trainerPart = trainerId != null ? trainerId.toString() : "null";
        return String.format("%s__%s__%s__%s", slug, date, startTime, trainerPart);
    }

    private String safeSlug(String input) {
        String s = input == null ? "" : input;
        return s.toLowerCase().replace(" ", "-");
    }
    
    private ScheduledSession generateSessionFromSchedule(TrainerSchedule schedule, LocalDate date) {
        ScheduledSession session = new ScheduledSession();
        session.setSessionSeriesId(schedule.getId());
        session.setSessionId(generateSessionId(schedule, date));
        session.setTrainerId(schedule.getTrainerId());
        session.setStartTime(LocalDateTime.of(date, schedule.getStartTime()));
        session.setEndTime(LocalDateTime.of(date, schedule.calculateEndTime()));
        session.setSeriesName(schedule.getSeriesName());
        session.setInstanceOverride(false); // Generated from schedule, no overrides
        session.setEffectiveFromTimestamp(Instant.now());
        return session;
    }
    
    private ScheduledSession getOrCreateSessionInstance(String sessionId) {
        return scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)
            .orElseGet(() -> {
                // Parse sessionId to extract date and find the schedule
                String[] parts = sessionId.split("__");
                if (parts.length == 3 || parts.length == 4) {
                    try {
                        String dateStr = parts[1];
                        String timeStr = parts[2];
                        final UUID providedTrainerId = (parts.length == 4 && parts[3] != null && !parts[3].isBlank() && !"null".equalsIgnoreCase(parts[3]))
                                ? safeParseUUID(parts[3])
                                : null;
                        LocalDate date = LocalDate.parse(dateStr);
                        LocalTime time = LocalTime.parse(timeStr);
                        int weekday = date.getDayOfWeek() == DayOfWeek.SUNDAY ? 0 : date.getDayOfWeek().getValue();
                        
                        // Find the schedule that matches
                        List<TrainerSchedule> schedules = trainerScheduleRepository
                            .findByWeekdayAndEffectiveFromTimestampLessThanEqual(weekday, date.atStartOfDay().toInstant(java.time.ZoneOffset.UTC));
                        
                        for (TrainerSchedule schedule : schedules) {
                            String canonical = generateSessionId(schedule, date);
                            String legacy = generateLegacySessionId(schedule, date);
                            if (schedule.getStartTime().equals(time) && (canonical.equals(sessionId) || legacy.equals(sessionId))) {
                                ScheduledSession session = generateSessionFromSchedule(schedule, date);
                                return scheduledSessionRepository.save(session);
                            }
                        }
                        // Fallback: slug may have changed (series renamed).
                        List<TrainerSchedule> timeMatches = schedules.stream()
                            .filter(s -> s.getStartTime().equals(time))
                            .toList();
                        if (!timeMatches.isEmpty()) {
                            // Use provided trainerId if present
                            if (providedTrainerId != null) {
                                List<TrainerSchedule> trainerMatches = timeMatches.stream()
                                        .filter(s -> providedTrainerId.equals(s.getTrainerId()))
                                        .toList();
                                if (trainerMatches.size() == 1) {
                                    ScheduledSession session = generateSessionFromSchedule(trainerMatches.get(0), date);
                                    return scheduledSessionRepository.save(session);
                                }
                            }
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

    private UUID safeParseUUID(String value) {
        try {
            return UUID.fromString(value);
        } catch (Exception e) {
            return null;
        }
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
        
        // Build participant override maps if there is a materialized session
        Set<UUID> excludedInInstance = new HashSet<>();
        Map<UUID, SessionParticipant> includedInInstance = new HashMap<>();
        if (existingSession != null) {
            List<SessionParticipant> overrides = sessionParticipantRepository.findByScheduledSession_IdAndIsActiveTrue(existingSession.getId());
            for (SessionParticipant sp : overrides) {
                if (sp.isExcluded()) excludedInInstance.add(sp.getStudentId());
                if (sp.isIncluded()) includedInInstance.put(sp.getStudentId(), sp);
            }
        }

        // Convert to DTOs and include exercise data if available, applying overrides
        for (StudentCommitment commitment : latestCommitmentsPerStudent.values()) {
            UUID studentId = commitment.getStudentId();
            String studentName = studentRepository.findById(studentId)
                .map(Student::getName)
                .orElse(null);

            List<ExerciseResponseDTO> exercises = new ArrayList<>();
            List<ParticipantExerciseResponseDTO> participantExerciseDtos = new ArrayList<>();
            Boolean present = null;
            String attendanceNotes = null;

            if (existingSession != null) {
                if (excludedInInstance.contains(studentId)) {
                    continue;
                }
                SessionParticipant participant = includedInInstance.get(studentId);
                if (participant != null) {
                    present = participant.isPresent();
                    attendanceNotes = participant.getAttendanceNotes();
                    List<ParticipantExercise> pes = participantExerciseRepository
                            .findIsActiveWithExerciseBySessionParticipantId(participant.getId());
                    for (ParticipantExercise participantExercise : pes) {
                        if (participantExercise.getExercise() != null) {
                            exercises.add(ExerciseResponseDTO.fromEntity(participantExercise.getExercise()));
                        }
                        participantExerciseDtos.add(new ParticipantExerciseResponseDTO(
                            participantExercise.getId(),
                            participantExercise.getExerciseId(),
                            participantExercise.getExercise() != null ? participantExercise.getExercise().getName() : null,
                            participantExercise.getSetsCompleted(),
                            participantExercise.getRepsCompleted(),
                            participantExercise.getWeightCompleted(),
                            participantExercise.getExerciseNotes(),
                            participantExercise.isDone()
                        ));
                    }
                } else if (commitment.getCommitmentStatus() == CommitmentStatus.ATTENDING) {
                    present = true;
                } else {
                    continue;
                }
            } else {
                if (commitment.getCommitmentStatus() == CommitmentStatus.ATTENDING) {
                    present = true;
                } else {
                    continue;
                }
            }

            studentCommitments.add(new StudentCommitmentResponseDTO(
                studentId,
                studentName,
                commitment.getCommitmentStatus(),
                exercises,
                participantExerciseDtos,
                present,
                attendanceNotes
            ));
        }
        
        // Also add any participants that were INCLUDED explicitly in the instance but do not have an ATTENDING series commitment entry
        if (existingSession != null) {
            for (SessionParticipant sp : includedInInstance.values()) {
                // If they were not added above (i.e., either no series commitment or series commitment was non-ATTENDING), include them now
                boolean alreadyAdded = studentCommitments.stream().anyMatch(sc -> sc.studentId().equals(sp.getStudentId()));
                if (!alreadyAdded) {
                    String studentName = studentRepository.findById(sp.getStudentId())
                        .map(Student::getName)
                        .orElse(null);
                    List<ParticipantExercise> pes = participantExerciseRepository
                        .findIsActiveWithExerciseBySessionParticipantId(sp.getId());
                    List<ExerciseResponseDTO> exercises = new ArrayList<>();
                    List<ParticipantExerciseResponseDTO> participantExerciseDtos = new ArrayList<>();
                    for (ParticipantExercise participantExercise : pes) {
                        if (participantExercise.getExercise() != null) {
                            exercises.add(ExerciseResponseDTO.fromEntity(participantExercise.getExercise()));
                        }
                        participantExerciseDtos.add(new ParticipantExerciseResponseDTO(
                            participantExercise.getId(),
                            participantExercise.getExerciseId(),
                            participantExercise.getExercise() != null ? participantExercise.getExercise().getName() : null,
                            participantExercise.getSetsCompleted(),
                            participantExercise.getRepsCompleted(),
                            participantExercise.getWeightCompleted(),
                            participantExercise.getExerciseNotes(),
                            participantExercise.isDone()
                        ));
                    }
                    studentCommitments.add(new StudentCommitmentResponseDTO(
                        sp.getStudentId(),
                        studentName,
                        CommitmentStatus.ATTENDING,
                        exercises,
                        participantExerciseDtos,
                        sp.isPresent(),
                        sp.getAttendanceNotes()
                    ));
                }
            }
        }

        return studentCommitments;
    }
    
}

package org.conexaotreinamento.conexaotreinamentobackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.io.IOException;
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
        List<ScheduledSession> sessions = new ArrayList<>();
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            
            // Find all active trainer schedules effective at this date (start of day) for this day of week
            int weekday = date.getDayOfWeek() == DayOfWeek.SUNDAY ? 0 : date.getDayOfWeek().getValue();
            Instant dateInstant = date.atStartOfDay(ZoneId.systemDefault()).toInstant();
            List<TrainerSchedule> daySchedules = trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampBeforeAndActive(
                weekday, dateInstant, true).stream()
                // repository query checks effective_from <= dateInstant; ensure effective_to is null or after dateInstant
                .filter(s -> s.getEffectiveToTimestamp() == null || !dateInstant.isAfter(s.getEffectiveToTimestamp()))
                .collect(Collectors.toList());
            
            // Create merged scheduled sessions for each schedule (lazy materialization with diffs)
            for (TrainerSchedule schedule : daySchedules) {
                // Generate time slots based on intervalDuration within the availability block [start_time, end_time)
                LocalTime blockStart = schedule.getStartTime();
                LocalTime blockEnd = schedule.getEndTime();
                int intervalMinutes = Math.max(1, schedule.getIntervalDuration());

                // Safety: avoid infinite loop if times are malformed
                if (blockStart == null || blockEnd == null || !blockStart.isBefore(blockEnd)) {
                    // Fallback to a single slot using the given start/end times
                    LocalDateTime slotStart = LocalDateTime.of(date, blockStart != null ? blockStart : LocalTime.MIN);
                    LocalDateTime slotEnd = LocalDateTime.of(date, blockEnd != null ? blockEnd : (blockStart != null ? blockStart.plusMinutes(intervalMinutes) : LocalTime.MIN.plusMinutes(intervalMinutes)));
                    Optional<ScheduledSession> overrideOpt = scheduledSessionRepository.findBySessionSeriesIdAndStartTime(
                        schedule.getId(), slotStart);
                    sessions.add(merge(schedule, overrideOpt, date, slotStart, slotEnd));
                    continue;
                }

                for (LocalTime slot = blockStart; slot.isBefore(blockEnd); slot = slot.plusMinutes(intervalMinutes)) {
                    LocalDateTime slotStart = LocalDateTime.of(date, slot);
                    LocalDateTime slotEnd = slot.plusMinutes(intervalMinutes).isAfter(blockEnd)
                            ? LocalDateTime.of(date, blockEnd)
                            : LocalDateTime.of(date, slot.plusMinutes(intervalMinutes));

                    // Skip zero/negative length slots
                    if (!slotStart.isBefore(slotEnd)) continue;

                    Optional<ScheduledSession> overrideOpt = scheduledSessionRepository.findBySessionSeriesIdAndStartTime(
                        schedule.getId(), slotStart);
                    sessions.add(merge(schedule, overrideOpt, date, slotStart, slotEnd));
                }
            }
        }
        
        return sessions.stream()
            .sorted(Comparator.comparing(ScheduledSession::getStartTime))
            .collect(Collectors.toList());
    }
    
    private String generateSessionId(TrainerSchedule schedule, LocalDate date, LocalDateTime slotStart) {
        // Include the series id to guarantee uniqueness across overlapping series with the same name/time
        return String.format("%s-%s-%s-%s",
            "series",
            schedule.getId(),
            date.toString(),
            (slotStart != null ? slotStart.toLocalTime() : schedule.getStartTime()).toString()
        );
    }
    
    private ScheduledSession merge(TrainerSchedule schedule, Optional<ScheduledSession> overrideOpt, LocalDate date, LocalDateTime slotStart, LocalDateTime slotEnd) {
        ScheduledSession override = overrideOpt.orElse(null);
        ScheduledSession merged = new ScheduledSession();
        merged.setId(UUID.randomUUID()); // Virtual ID for virtual
        merged.setSessionSeriesId(schedule.getId());
        merged.setSessionId(generateSessionId(schedule, date, slotStart));
        LocalDateTime startTime = slotStart != null ? slotStart : LocalDateTime.of(date, schedule.getStartTime());
        LocalDateTime endTime = slotEnd != null ? slotEnd : LocalDateTime.of(date, schedule.getEndTime());
        merged.setStartTime(startTime);
        merged.setEndTime(endTime);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode diffNode = null;
        if (override != null && override.getDiff() != null && !override.getDiff().isBlank()) {
            try {
                diffNode = mapper.readTree(override.getDiff());
            } catch (IOException e) {
                // If diff parsing fails, log and fall back to legacy override fields
                System.err.println("Failed to parse session diff for override " + override.getSessionId() + ": " + e.getMessage());
                diffNode = null;
            }
        }

        // Canceled flag: when set, treat as no-trainer (cancelled session)
        boolean canceled = false;
        if (diffNode != null && diffNode.has("canceled")) {
            canceled = diffNode.get("canceled").asBoolean(false);
        }

        // Merge trainerId: diff has precedence. If diff declares the key:
        // - key present & null => explicit no-trainer
        // - key present & value  => override value
        // else fallback to legacy override.trainerId or schedule.trainerId
        if (canceled) {
            merged.setTrainerId(null);
        } else if (diffNode != null && diffNode.has("trainerId")) {
            if (diffNode.get("trainerId").isNull()) {
                merged.setTrainerId(null);
            } else {
                try {
                    merged.setTrainerId(UUID.fromString(diffNode.get("trainerId").asText()));
                } catch (IllegalArgumentException ex) {
                    merged.setTrainerId(null);
                }
            }
        } else if (override != null && override.getTrainerId() != null) {
            merged.setTrainerId(override.getTrainerId());
        } else {
            merged.setTrainerId(schedule.getTrainerId());
        }

        // Merge maxParticipants: diff -> legacy override -> schedule -> default
        if (diffNode != null && diffNode.has("maxParticipants")) {
            if (diffNode.get("maxParticipants").isNull()) {
                merged.setMaxParticipants(null);
            } else {
                merged.setMaxParticipants(diffNode.get("maxParticipants").asInt());
            }
        } else if (override != null && override.getMaxParticipants() != null) {
            merged.setMaxParticipants(override.getMaxParticipants());
        } else if (schedule.getMaxParticipants() != null) {
            merged.setMaxParticipants(schedule.getMaxParticipants());
        } else {
            merged.setMaxParticipants(10);
        }

        // Merge seriesName
        if (diffNode != null && diffNode.has("seriesName")) {
            if (diffNode.get("seriesName").isNull()) {
                merged.setSeriesName(null);
            } else {
                merged.setSeriesName(diffNode.get("seriesName").asText());
            }
        } else if (override != null && override.getSeriesName() != null) {
            merged.setSeriesName(override.getSeriesName());
        } else {
            merged.setSeriesName(schedule.getSeriesName());
        }

        // Merge notes
        if (diffNode != null && diffNode.has("notes")) {
            if (diffNode.get("notes").isNull()) {
                merged.setNotes(null);
            } else {
                merged.setNotes(diffNode.get("notes").asText());
            }
        } else if (override != null && override.getNotes() != null) {
            merged.setNotes(override.getNotes());
        } else {
            merged.setNotes(null);
        }

        // Merge room
        if (diffNode != null && diffNode.has("room")) {
            if (diffNode.get("room").isNull()) {
                merged.setRoom(null);
            } else {
                merged.setRoom(diffNode.get("room").asText());
            }
        } else if (override != null && override.getRoom() != null) {
            merged.setRoom(override.getRoom());
        } else {
            merged.setRoom(null);
        }

        // Merge equipment
        if (diffNode != null && diffNode.has("equipment")) {
            if (diffNode.get("equipment").isNull()) {
                merged.setEquipment(null);
            } else {
                merged.setEquipment(diffNode.get("equipment").asText());
            }
        } else if (override != null && override.getEquipment() != null) {
            merged.setEquipment(override.getEquipment());
        } else {
            merged.setEquipment(null);
        }

    merged.setInstanceOverride(override != null);
    merged.setCanceled(canceled);
        // Use the actual session start instant as the effective_from for the merged (virtual) session
        merged.setEffectiveFromTimestamp(startTime.atZone(ZoneId.systemDefault()).toInstant());

        return merged;
    }
    
    // Example method for creating one-off session (persist)
    public ScheduledSession createOneOffSession(ScheduledSession session) {
        session.setInstanceOverride(true);
        session.setEffectiveFromTimestamp(Instant.now());
        return scheduledSessionRepository.save(session);
    }
    
    // Method for updating schedule (temporal split)
    @org.springframework.transaction.annotation.Transactional
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
        
        // Persist the new schedule first
        TrainerSchedule savedNew = trainerScheduleRepository.save(newSchedule);
        
        // If the caller provided an existing schedule id, update its effectiveToTimestamp to implement "this and following" split.
        if (updatedSchedule != null && updatedSchedule.getId() != null) {
            trainerScheduleRepository.findById(updatedSchedule.getId()).ifPresent(existing -> {
                // Only set effectiveTo if it's after the existing effectiveFrom (avoid shrinking past history)
                if (existing.getEffectiveFromTimestamp() == null || existing.getEffectiveFromTimestamp().isBefore(newEffectiveFrom)) {
                    existing.setEffectiveToTimestamp(newEffectiveFrom);
                    trainerScheduleRepository.save(existing);
                }
            });
        }

        return savedNew;
    }
    
    public TrainerSchedule createTrainerSchedule(TrainerSchedule schedule) {
        if (schedule == null) throw new IllegalArgumentException("Schedule cannot be null");
        if (schedule.getEffectiveFromTimestamp() == null) schedule.setEffectiveFromTimestamp(Instant.now());
        schedule.setActive(true);
        return trainerScheduleRepository.save(schedule);
    }

    /**
     * Atomically split a trainer's weekly schedule into a new effective segment starting at newEffectiveFrom.
     * For each weekday in the request, create an active series when active=true, or skip when active=false.
     * All prior active series become closed (effectiveTo=newEffectiveFrom).
     */
    @org.springframework.transaction.annotation.Transactional
    public List<TrainerSchedule> splitWeek(UUID trainerId, Instant newEffectiveFrom, String seriesName, Integer intervalDuration, List<org.conexaotreinamento.conexaotreinamentobackend.dto.request.WeekSplitRequestDTO.DayConfig> days) {
        if (trainerId == null || newEffectiveFrom == null || days == null) return Collections.emptyList();

        // Close all current active series for this trainer at split time
        Instant nowSplit = newEffectiveFrom;
        List<TrainerSchedule> current = trainerScheduleRepository.findActiveSeriesByTrainerAndWeekdaysAt(trainerId,
            days.stream().map(org.conexaotreinamento.conexaotreinamentobackend.dto.request.WeekSplitRequestDTO.DayConfig::getWeekday).distinct().toList(), nowSplit);
        for (TrainerSchedule ts : current) {
            if (ts.getEffectiveToTimestamp() == null || nowSplit.isBefore(ts.getEffectiveToTimestamp())) {
                ts.setEffectiveToTimestamp(nowSplit);
            }
            // keep active=true for history visibility; closing the window is enough
            ts.updateTimestamp();
        }
        trainerScheduleRepository.saveAll(current);

        // Create the new segment for the provided weekdays
        List<TrainerSchedule> created = new ArrayList<>();
        for (org.conexaotreinamento.conexaotreinamentobackend.dto.request.WeekSplitRequestDTO.DayConfig day : days) {
            if (Boolean.TRUE.equals(day.getActive())) {
                TrainerSchedule ns = new TrainerSchedule();
                ns.setTrainerId(trainerId);
                ns.setWeekday(day.getWeekday());
                ns.setStartTime(day.getStartTime());
                ns.setEndTime(day.getEndTime());
                ns.setIntervalDuration(intervalDuration != null ? intervalDuration : 60);
                if (seriesName != null && !seriesName.isBlank()) ns.setSeriesName(seriesName);
                else ns.setSeriesName("Aula");
                ns.setEffectiveFromTimestamp(nowSplit);
                ns.setActive(true);
                created.add(trainerScheduleRepository.save(ns));
            }
        }

        return created;
    }
    
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<TrainerSchedule> findAllSeries(UUID trainerId) {
        Instant now = Instant.now();
        return trainerScheduleRepository.findActiveSeriesAt(trainerId, now);
    }

    /**
     * Deactivate (end) currently-active series for a trainer on the provided weekdays by setting effectiveTo=now and active=false.
     * This supports the generator's "inactive" weekdays semantics so they don't reappear after refresh.
     */
    @org.springframework.transaction.annotation.Transactional
    public List<TrainerSchedule> deactivateCurrentWeekdays(UUID trainerId, List<Integer> weekdays) {
        if (trainerId == null || weekdays == null || weekdays.isEmpty()) return Collections.emptyList();
        Instant now = Instant.now();
        List<TrainerSchedule> targets = trainerScheduleRepository.findActiveSeriesByTrainerAndWeekdaysAt(trainerId, weekdays, now);
        for (TrainerSchedule ts : targets) {
            // Only close the current segment if open-ended or in the future
            if (ts.getEffectiveToTimestamp() == null || now.isBefore(ts.getEffectiveToTimestamp())) {
                ts.setEffectiveToTimestamp(now);
            }
            ts.setActive(false);
            ts.updateTimestamp();
        }
        return trainerScheduleRepository.saveAll(targets);
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
     * Update per-session overrides using a compact JSON diff. Creates an override record if it does not exist yet.
     */
    public void updateSessionOverrides(String sessionId, org.conexaotreinamento.conexaotreinamentobackend.dto.request.SessionUpdateRequestDTO request) {
        Optional<ScheduledSession> opt = scheduledSessionRepository.findBySessionId(sessionId);
        ScheduledSession session = opt.orElseGet(() -> {
            // Create a minimal override if missing; we need session series to compute merged values client-side
            ScheduledSession s = new ScheduledSession();
            s.setSessionId(sessionId);
            s.setInstanceOverride(true);
            // effective_from left null here; will be set on first persistence below using now
            return s;
        });

        // Apply legacy note update for convenience
        if (request.getNotes() != null) {
            session.setNotes(request.getNotes());
        }

        // Merge into diff JSON allowing explicit nulls
        ObjectMapper mapper = new ObjectMapper();
        com.fasterxml.jackson.databind.node.ObjectNode diffNode;
        try {
            if (session.getDiff() != null && !session.getDiff().isBlank()) {
                diffNode = (com.fasterxml.jackson.databind.node.ObjectNode) mapper.readTree(session.getDiff());
            } else {
                diffNode = mapper.createObjectNode();
            }
        } catch (Exception e) {
            diffNode = mapper.createObjectNode();
        }

        // Map DTO extension fields if present via reflection-safe access
        try {
            java.lang.reflect.Method getTrainerId = request.getClass().getMethod("getTrainerId");
            Object v = getTrainerId.invoke(request);
            if (v != null) {
                diffNode.put("trainerId", v.toString());
            }
        } catch (Exception ignored) {}
        try {
            java.lang.reflect.Method getMaxParticipants = request.getClass().getMethod("getMaxParticipants");
            Object v = getMaxParticipants.invoke(request);
            if (v != null) {
                diffNode.put("maxParticipants", ((Number) v).intValue());
            }
        } catch (Exception ignored) {}
        try {
            java.lang.reflect.Method getCanceled = request.getClass().getMethod("getCanceled");
            Object v = getCanceled.invoke(request);
            if (v != null) {
                diffNode.put("canceled", (Boolean) v);
            }
        } catch (Exception ignored) {}
        try {
            java.lang.reflect.Method getRoom = request.getClass().getMethod("getRoom");
            Object v = getRoom.invoke(request);
            if (v != null) {
                diffNode.put("room", v.toString());
            }
        } catch (Exception ignored) {}
        try {
            java.lang.reflect.Method getEquipment = request.getClass().getMethod("getEquipment");
            Object v = getEquipment.invoke(request);
            if (v != null) {
                diffNode.put("equipment", v.toString());
            }
        } catch (Exception ignored) {}

        // Persist
        try {
            session.setDiff(diffNode.size() > 0 ? mapper.writeValueAsString(diffNode) : null);
        } catch (Exception ex) {
            session.setDiff(null);
        }
        if (session.getEffectiveFromTimestamp() == null) {
            session.setEffectiveFromTimestamp(Instant.now());
        }
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

        // Group requested sessions by the plan assignment that covers each session's start time.
        Map<UUID, List<EnrollmentRequestDTO.EnrollmentSessionDTO>> sessionsByAssignment = new HashMap<>();
        Map<UUID, StudentPlanAssignment> assignmentById = new HashMap<>();

        for (EnrollmentRequestDTO.EnrollmentSessionDTO s : request.getSessions()) {
            Instant sessionInstant = s.getStartTime();

            // Find the plan assignment that was active at the session start time
            List<StudentPlanAssignment> assignments = planAssignmentRepository.findByStudentIdAndEffectiveFromTimestampBeforeOrderByEffectiveFromTimestampDesc(
                studentId, sessionInstant);
            if (assignments == null || assignments.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No active plan assignment for student at session time: " + s.getSessionId());
            }
            StudentPlanAssignment assignment = assignments.get(0);
            if (assignment.getEffectiveToTimestamp() != null && sessionInstant.isAfter(assignment.getEffectiveToTimestamp())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No active plan assignment for student at session time: " + s.getSessionId());
            }

            sessionsByAssignment.computeIfAbsent(assignment.getId(), k -> new ArrayList<>()).add(s);
            assignmentById.putIfAbsent(assignment.getId(), assignment);
        }

        // For each assignment, validate plan limits within that assignment window
        for (Map.Entry<UUID, List<EnrollmentRequestDTO.EnrollmentSessionDTO>> entry : sessionsByAssignment.entrySet()) {
            UUID assignmentId = entry.getKey();
            StudentPlanAssignment assignment = assignmentById.get(assignmentId);

            StudentPlan plan = studentPlanRepository.findByIdAndActiveTrue(assignment.getPlanId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigned plan not found"));

            int maxDays = plan.getMaxDays();

            LocalDateTime startRange = LocalDateTime.ofInstant(assignment.getEffectiveFromTimestamp(), ZoneId.systemDefault());
            LocalDateTime endRange = LocalDateTime.ofInstant(assignment.getEffectiveToTimestamp(), ZoneId.systemDefault());

            long existingEnrollments = scheduledSessionRepository.countSessionsWithParticipantInRange(studentId, startRange, endRange);

            // Count unique new session ids for this assignment
            Set<String> uniqueNew = entry.getValue().stream().map(EnrollmentRequestDTO.EnrollmentSessionDTO::getSessionId).collect(Collectors.toSet());
            long newEnrollments = uniqueNew.size();

            if (existingEnrollments + newEnrollments > maxDays) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Plan limit exceeded for student within assignment starting " + assignment.getEffectiveFromTimestamp()
                        + ": maxDays=" + maxDays + " (existing=" + existingEnrollments + ", requested=" + newEnrollments + ")");
            }
        }

        // Persist enrollments (create per-session overrides when needed) with validation:
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
                session.setStartTime(LocalDateTime.ofInstant(s.getStartTime(), ZoneId.systemDefault()));
                session.setEndTime(LocalDateTime.ofInstant(s.getEndTime(), ZoneId.systemDefault()));
                session.setMaxParticipants(s.getMaxParticipants());
                session.setSeriesName(s.getSeriesName());
                session.setInstanceOverride(true);
                // use the session start instant as effective_from
                session.setEffectiveFromTimestamp(s.getStartTime());
                // newly created override instance

                // Persist a compact JSON diff representing explicit overrides (only when this is an override
                // of a series). This keeps instance storage minimal and supports explicit nulls later.
                if (session.getSessionSeriesId() != null) {
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        com.fasterxml.jackson.databind.node.ObjectNode diffNode = mapper.createObjectNode();
                        if (s.getTrainerId() != null) diffNode.put("trainerId", s.getTrainerId().toString());
                        if (s.getMaxParticipants() != null) diffNode.put("maxParticipants", s.getMaxParticipants());
                        if (s.getSeriesName() != null) diffNode.put("seriesName", s.getSeriesName());
                        // other fields (notes, room, equipment) can be added by separate APIs that explicitly set them
                        if (diffNode.size() > 0) {
                            session.setDiff(mapper.writeValueAsString(diffNode));
                        } else {
                            session.setDiff(null);
                        }
                    } catch (Exception ex) {
                        // swallow JSON errors and leave diff null so merge will fallback to legacy fields
                        session.setDiff(null);
                    }
                } else {
                    session.setDiff(null);
                }
            }

            // Determine effective capacity (session override -> series schedule -> default)
            Integer effectiveMax = session.getMaxParticipants();
            if (effectiveMax == null && session.getSessionSeriesId() != null) {
                trainerScheduleRepository.findById(session.getSessionSeriesId()).ifPresent(ts -> {
                    // set if present (we will read it below via closure)
                });
            }
            if (effectiveMax == null && session.getSessionSeriesId() != null) {
                effectiveMax = trainerScheduleRepository.findById(session.getSessionSeriesId())
                    .map(TrainerSchedule::getMaxParticipants)
                    .orElse(null);
            }
            if (effectiveMax == null) effectiveMax = 10; // default fallback

            // Load current participants (active + INCLUDED) and check duplicates
            List<SessionParticipant> currentParticipants = session.getParticipants() != null ? session.getParticipants() : new ArrayList<>();
            long activeIncluded = currentParticipants.stream()
                .filter(p -> p.isActive() && p.getParticipationType() == SessionParticipant.ParticipationType.INCLUDED)
                .count();

            boolean alreadyEnrolled = currentParticipants.stream()
                .anyMatch(p -> p.isActive() && p.getParticipationType() == SessionParticipant.ParticipationType.INCLUDED
                    && p.getStudentId().equals(request.getStudentId()));

            if (alreadyEnrolled) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Student already enrolled in session: " + s.getSessionId());
            }

            if (activeIncluded >= effectiveMax) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Session is full: " + s.getSessionId());
            }

            // Create participant entry
            SessionParticipant participant = new SessionParticipant();
            participant.setStudentId(request.getStudentId());
            participant.setParticipationType(SessionParticipant.ParticipationType.INCLUDED);
            participant.setPresent(false);
            participant.setScheduledSession(session);

            // Append and persist
            List<SessionParticipant> participants = session.getParticipants();
            if (participants == null) {
                participants = new ArrayList<>();
            }
            participants.add(participant);
            session.setParticipants(participants);

            // If we created a new override but the session references a series id, ensure we persist it as an override
            scheduledSessionRepository.save(session);
        }
    }
}

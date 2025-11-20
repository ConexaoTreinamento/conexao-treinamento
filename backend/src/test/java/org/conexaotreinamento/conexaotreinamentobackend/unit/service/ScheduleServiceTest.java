package org.conexaotreinamento.conexaotreinamentobackend.unit.service;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.SessionResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.*;
import org.conexaotreinamento.conexaotreinamentobackend.entity.*;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.repository.*;
import org.conexaotreinamento.conexaotreinamentobackend.service.ScheduleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceTest {

    @Mock
    private TrainerScheduleRepository trainerScheduleRepository;

    @Mock
    private ScheduledSessionRepository scheduledSessionRepository;

    @Mock
    private SessionParticipantRepository sessionParticipantRepository;

    @Mock
    private StudentCommitmentRepository studentCommitmentRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private TrainerRepository trainerRepository;

    @Mock
    private ParticipantExerciseRepository participantExerciseRepository;

    @InjectMocks
    private ScheduleService scheduleService;

    private UUID trainerId;
    private Trainer trainer;

    @BeforeEach
    void setUp() {
        trainerId = UUID.randomUUID();
        trainer = new Trainer();
        trainer.setId(trainerId);
        trainer.setName("John Trainer");
    }

    private TrainerSchedule buildSchedule(UUID id, UUID trainerId, String seriesName, LocalTime start, int intervalMinutes) {
        TrainerSchedule s = new TrainerSchedule();
        s.setId(id != null ? id : UUID.randomUUID());
        s.setTrainerId(trainerId);
        s.setSeriesName(seriesName);
        s.setStartTime(start);
        s.setIntervalDuration(intervalMinutes);
        s.setEffectiveFromTimestamp(Instant.now().minus(Duration.ofDays(1)));
        return s;
    }

    private ScheduledSession buildExistingSession(UUID id, String sessionId, UUID sessionSeriesId, UUID trainerId, LocalDate date, LocalTime start, LocalTime end, String notes, boolean instanceOverride) {
        ScheduledSession ss = new ScheduledSession();
        ss.setId(id != null ? id : UUID.randomUUID());
        ss.setSessionId(sessionId);
        ss.setSessionSeriesId(sessionSeriesId);
        ss.setTrainerId(trainerId);
        ss.setStartTime(LocalDateTime.of(date, start));
        ss.setEndTime(LocalDateTime.of(date, end));
        ss.setNotes(notes);
        ss.setSeriesName("Yoga Basics");
        ss.setInstanceOverride(instanceOverride);
        ss.setEffectiveFromTimestamp(Instant.now());
        return ss;
    }

    @Test
    void getScheduledSessions_generatesFromTrainerSchedules_whenNoExistingInstances() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26); // Friday
        LocalTime start = LocalTime.of(9, 0);
        int intervalMinutes = 60;
        LocalTime end = start.plusMinutes(intervalMinutes);
        TrainerSchedule schedule = buildSchedule(UUID.randomUUID(), trainerId, "Yoga Basics", start, intervalMinutes);

        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(schedule));
        when(scheduledSessionRepository.findByStartTimeBetweenAndActiveTrue(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(studentCommitmentRepository.findBySessionSeriesId(schedule.getId())).thenReturn(List.of());

        // Act
        List<SessionResponseDTO> sessions = scheduleService.getScheduledSessions(date, date);

        // Assert
        assertEquals(1, sessions.size());
        SessionResponseDTO dto = sessions.get(0);
        assertEquals(trainerId, dto.trainerId());
        assertEquals(LocalDateTime.of(date, start), dto.startTime());
        assertEquals(LocalDateTime.of(date, end), dto.endTime());
        assertEquals("Yoga Basics", dto.seriesName());
        assertEquals("John Trainer", dto.trainerName());
        assertFalse(dto.instanceOverride());
        assertNotNull(dto.sessionId());
        // Expected canonical format including trainerId: "yoga-basics__YYYY-MM-DD__HH:MM__{trainerId}"
        String expectedCanonical = "yoga-basics__" + date + "__09:00__" + trainerId;
        assertEquals(expectedCanonical, dto.sessionId());
        assertNotNull(dto.students());
        assertTrue(dto.students().isEmpty());
    }

    @Test
    void getScheduledSessions_usesExistingInstanceData_whenInstancePresent() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        LocalTime start = LocalTime.of(9, 0);
        int intervalMinutes = 60;
        LocalTime end = start.plusMinutes(intervalMinutes);
        TrainerSchedule schedule = buildSchedule(UUID.randomUUID(), trainerId, "Yoga Basics", start, intervalMinutes);

        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(schedule));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(studentCommitmentRepository.findBySessionSeriesId(schedule.getId())).thenReturn(List.of());

        // Build an existing instance (legacy 3-part id), service should still emit canonical 4-part id
        String legacySessionId = "yoga-basics__" + date + "__09:00";
        ScheduledSession existing = buildExistingSession(UUID.randomUUID(), legacySessionId, schedule.getId(), trainerId, date, start, end, "Bring water bottle", true);

        when(scheduledSessionRepository.findByStartTimeBetweenAndActiveTrue(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(existing));

        // Act
        List<SessionResponseDTO> sessions = scheduleService.getScheduledSessions(date, date);

        // Assert
        assertEquals(1, sessions.size());
        SessionResponseDTO dto = sessions.get(0);
    // Expect canonical 4-part id including trainerId for disambiguation
        String expectedCanonical = "yoga-basics__" + date + "__09:00__" + trainerId;
        assertEquals(expectedCanonical, dto.sessionId());
        assertEquals("Bring water bottle", dto.notes());
        assertTrue(dto.instanceOverride());
    }

    @Test
    void getScheduledSessions_passesSundayAsWeekdayZero() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 28); // Sunday
        when(scheduledSessionRepository.findByStartTimeBetweenAndActiveTrue(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of());

        // Act
        scheduleService.getScheduledSessions(date, date);

        // Assert: capture weekday argument
        ArgumentCaptor<Integer> weekdayCaptor = ArgumentCaptor.forClass(Integer.class);
        verify(trainerScheduleRepository, atLeastOnce()).findByWeekdayAndEffectiveFromTimestampLessThanEqual(weekdayCaptor.capture(), any(Instant.class));
        assertEquals(0, weekdayCaptor.getValue());
    }

    @Test
    void updateSessionNotes_updatesExistingInstance() {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        ScheduledSession existing = new ScheduledSession();
        existing.setId(UUID.randomUUID());
        existing.setSessionId(sessionId);
        existing.setInstanceOverride(false);

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(existing));
        when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        scheduleService.updateSessionNotes(sessionId, "Note B");

        // Assert
        ArgumentCaptor<ScheduledSession> captor = ArgumentCaptor.forClass(ScheduledSession.class);
        verify(scheduledSessionRepository).save(captor.capture());
        ScheduledSession saved = captor.getValue();
        assertEquals("Note B", saved.getNotes());
        assertTrue(saved.isInstanceOverride());
    }

    @Test
    void updateSessionParticipants_replacesAndMarksOverride() {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        ScheduledSession existing = new ScheduledSession();
        UUID existingSessionId = UUID.randomUUID();
        existing.setId(existingSessionId);
        existing.setSessionId(sessionId);
        existing.setInstanceOverride(false);

        SessionParticipant oldP = new SessionParticipant();
        oldP.setId(UUID.randomUUID());
        oldP.setScheduledSession(existing);

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(existing));
        when(sessionParticipantRepository.findByScheduledSession_IdAndActiveTrue(existingSessionId)).thenReturn(List.of(oldP));
        when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // New participants to add
        SessionParticipant newP = new SessionParticipant();
        newP.setStudentId(UUID.randomUUID());
        newP.setPresent(true);

        // Act
        scheduleService.updateSessionParticipants(sessionId, List.of(newP));

        // Assert: old participant soft-deleted and saved
        verify(sessionParticipantRepository).save(oldP);
        // New participant should be linked to session and saved
        ArgumentCaptor<SessionParticipant> partCaptor = ArgumentCaptor.forClass(SessionParticipant.class);
        verify(sessionParticipantRepository, times(2)).save(partCaptor.capture()); // old + new
        List<SessionParticipant> savedParts = partCaptor.getAllValues();
        SessionParticipant savedNew = savedParts.get(1);
        assertNotNull(savedNew.getScheduledSession());
        assertEquals(existingSessionId, savedNew.getScheduledSession().getId());

        // Session marked as override
        ArgumentCaptor<ScheduledSession> sessCaptor = ArgumentCaptor.forClass(ScheduledSession.class);
        verify(scheduledSessionRepository, atLeastOnce()).save(sessCaptor.capture());
        ScheduledSession lastSaved = sessCaptor.getAllValues().get(sessCaptor.getAllValues().size() - 1);
        assertTrue(lastSaved.isInstanceOverride());
    }

    @Test
    void getOrCreateSessionInstance_throws_whenSessionIdInvalid() {
        // Arrange
        String badId = "not-enough-parts";
        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(badId)).thenReturn(Optional.empty());

        // Act + Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            // Call indirectly via public method that uses it: update notes
            scheduleService.updateSessionNotes(badId, "x");
        });
        assertTrue(ex.getMessage().contains("Could not create session instance"), "Unexpected message: " + ex.getMessage());
    }

    @Test
    void getScheduledSessions_returnsSortedByStartTime() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        TrainerSchedule s1 = buildSchedule(UUID.randomUUID(), trainerId, "Morning Flow", LocalTime.of(8, 0), 60);
        TrainerSchedule s2 = buildSchedule(UUID.randomUUID(), trainerId, "Power Yoga", LocalTime.of(7, 0), 60);

        when(scheduledSessionRepository.findByStartTimeBetweenAndActiveTrue(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(s1, s2));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(studentCommitmentRepository.findBySessionSeriesId(any(UUID.class))).thenReturn(List.of());

        // Act
        List<SessionResponseDTO> sessions = scheduleService.getScheduledSessions(date, date);

        // Assert: sorted ascending by start time
        assertEquals(2, sessions.size());
        assertTrue(sessions.get(0).startTime().isBefore(sessions.get(1).startTime()));
    }

    @Test
    void createOneOffSession_createsAndReturnsSession() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 10, 1);
        LocalTime start = LocalTime.of(14, 0);
        LocalTime end = LocalTime.of(15, 0);
        OneOffSessionCreateRequestDTO req = new OneOffSessionCreateRequestDTO(
                "Special Workshop",
                trainerId,
                LocalDateTime.of(date, start),
                LocalDateTime.of(date, end),
                "Workshop notes"
        );

        // Mock getSessionById to return the DTO after creation
        // We need to mock the repository findBySessionIdAndActiveTrue to return the saved session
        // But getSessionById calls scheduledSessionRepository.findBySessionIdAndActiveTrue
        // So we need to capture the saved session and return it when find is called
        
        doAnswer(invocation -> {
            ScheduledSession saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            when(scheduledSessionRepository.findBySessionIdAndActiveTrue(saved.getSessionId()))
                .thenReturn(Optional.of(saved));
            return saved;
        }).when(scheduledSessionRepository).save(any(ScheduledSession.class));

        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));

        // Act
        SessionResponseDTO result = scheduleService.createOneOffSession(req);

        // Assert
        assertNotNull(result);
        assertEquals("Special Workshop", result.seriesName());
        assertEquals(trainerId, result.trainerId());
        assertEquals(LocalDateTime.of(date, start), result.startTime());
        assertEquals(LocalDateTime.of(date, end), result.endTime());
        assertEquals("Workshop notes", result.notes());
        assertTrue(result.instanceOverride());
        assertTrue(result.sessionId().startsWith("oneoff__"));
    }

    @Test
    void cancelOrRestoreSession_cancelsSession() {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        ScheduledSession existing = new ScheduledSession();
        existing.setId(UUID.randomUUID());
        existing.setSessionId(sessionId);
        existing.setCanceled(false);

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(existing));
        when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        scheduleService.cancelOrRestoreSession(sessionId, true);

        // Assert
        assertTrue(existing.isCanceled());
        assertTrue(existing.isInstanceOverride());
        verify(scheduledSessionRepository).save(existing);
    }

    @Test
    void updateSessionTrainer_updatesTrainer() {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        ScheduledSession existing = new ScheduledSession();
        existing.setId(UUID.randomUUID());
        existing.setSessionId(sessionId);
        existing.setTrainerId(UUID.randomUUID());

        UUID newTrainerId = UUID.randomUUID();

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(existing));
        when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        scheduleService.updateSessionTrainer(sessionId, newTrainerId);

        // Assert
        assertEquals(newTrainerId, existing.getTrainerId());
        assertTrue(existing.isInstanceOverride());
        verify(scheduledSessionRepository).save(existing);
    }

    @Test
    void addParticipant_addsIncludedOverride() {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        ScheduledSession existing = new ScheduledSession();
        existing.setId(UUID.randomUUID());
        existing.setSessionId(sessionId);
        UUID studentId = UUID.randomUUID();

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(existing));
        when(sessionParticipantRepository.findByScheduledSession_IdAndStudentIdAndActiveTrue(existing.getId(), studentId))
                .thenReturn(new ArrayList<>());
        when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        scheduleService.addParticipant(sessionId, studentId);

        // Assert
        ArgumentCaptor<SessionParticipant> captor = ArgumentCaptor.forClass(SessionParticipant.class);
        verify(sessionParticipantRepository).save(captor.capture());
        SessionParticipant saved = captor.getValue();
        assertEquals(studentId, saved.getStudentId());
        assertTrue(saved.isIncluded());
        assertTrue(existing.isInstanceOverride());
    }

    @Test
    void removeParticipant_addsExcludedOverride() {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        ScheduledSession existing = new ScheduledSession();
        existing.setId(UUID.randomUUID());
        existing.setSessionId(sessionId);
        UUID studentId = UUID.randomUUID();

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(existing));
        when(sessionParticipantRepository.findByScheduledSession_IdAndStudentIdAndActiveTrue(existing.getId(), studentId))
                .thenReturn(new ArrayList<>());
        when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        scheduleService.removeParticipant(sessionId, studentId);

        // Assert
        ArgumentCaptor<SessionParticipant> captor = ArgumentCaptor.forClass(SessionParticipant.class);
        verify(sessionParticipantRepository).save(captor.capture());
        SessionParticipant saved = captor.getValue();
        assertEquals(studentId, saved.getStudentId());
        assertTrue(saved.isExcluded());
        assertTrue(existing.isInstanceOverride());
    }

    @Test
    void updateParticipantPresence_updatesExistingIncluded() {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        ScheduledSession existing = new ScheduledSession();
        existing.setId(UUID.randomUUID());
        existing.setSessionId(sessionId);
        UUID studentId = UUID.randomUUID();

        SessionParticipant sp = new SessionParticipant();
        sp.setStudentId(studentId);
        sp.setParticipationType(SessionParticipant.ParticipationType.INCLUDED);
        sp.setPresent(false);

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(existing));
        when(sessionParticipantRepository.findByScheduledSession_IdAndStudentIdAndActiveTrue(existing.getId(), studentId))
                .thenReturn(List.of(sp));
        when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        scheduleService.updateParticipantPresence(sessionId, studentId, true, "Late arrival");

        // Assert
        assertTrue(sp.isPresent());
        assertEquals("Late arrival", sp.getAttendanceNotes());
        verify(sessionParticipantRepository).save(sp);
    }

    @Test
    void addParticipantExercise_addsExerciseToParticipant() {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        UUID studentId = UUID.randomUUID();
        UUID exerciseId = UUID.randomUUID();
        
        ScheduledSession session = new ScheduledSession();
        session.setId(UUID.randomUUID());
        session.setSessionId(sessionId);
        
        SessionParticipant participant = new SessionParticipant();
        participant.setId(UUID.randomUUID());
        participant.setScheduledSession(session);
        participant.setStudentId(studentId);
        
        ParticipantExerciseCreateRequestDTO req = new ParticipantExerciseCreateRequestDTO(
            exerciseId, 3, 10, 20.5, "Good form", true
        );

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(session));
        when(sessionParticipantRepository.findByScheduledSession_IdAndStudentIdAndActiveTrue(session.getId(), studentId))
            .thenReturn(List.of(participant));
        when(participantExerciseRepository.save(any(ParticipantExercise.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ParticipantExercise result = scheduleService.addParticipantExercise(sessionId, studentId, req);

        // Assert
        assertNotNull(result);
        assertEquals(exerciseId, result.getExerciseId());
        assertEquals(3, result.getSetsCompleted());
        assertEquals(10, result.getRepsCompleted());
        assertEquals(20.5, result.getWeightCompleted());
        assertEquals("Good form", result.getExerciseNotes());
        assertTrue(result.isDone());
        assertEquals(participant, result.getSessionParticipant());
        
        verify(participantExerciseRepository).save(any(ParticipantExercise.class));
        verify(scheduledSessionRepository).save(session);
        assertTrue(session.isInstanceOverride());
    }

    @Test
    void updateParticipantExercise_updatesExistingExercise() {
        // Arrange
        UUID exerciseRecordId = UUID.randomUUID();
        ParticipantExercise existing = new ParticipantExercise();
        existing.setId(exerciseRecordId);
        existing.setSetsCompleted(3);
        
        ParticipantExerciseUpdateRequestDTO req = new ParticipantExerciseUpdateRequestDTO(
            4, null, null, "Updated notes", null
        );
        
        when(participantExerciseRepository.findById(exerciseRecordId)).thenReturn(Optional.of(existing));
        when(participantExerciseRepository.save(any(ParticipantExercise.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        scheduleService.updateParticipantExercise(exerciseRecordId, req);

        // Assert
        assertEquals(4, existing.getSetsCompleted());
        assertEquals("Updated notes", existing.getExerciseNotes());
        verify(participantExerciseRepository).save(existing);
    }

    @Test
    void removeParticipantExercise_softDeletesExercise() {
        // Arrange
        UUID exerciseRecordId = UUID.randomUUID();
        ParticipantExercise existing = new ParticipantExercise();
        existing.setId(exerciseRecordId);
        existing.setActive(true);
        
        when(participantExerciseRepository.findById(exerciseRecordId)).thenReturn(Optional.of(existing));
        when(participantExerciseRepository.save(any(ParticipantExercise.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        scheduleService.removeParticipantExercise(exerciseRecordId);

        // Assert
        assertFalse(existing.isActive());
        verify(participantExerciseRepository).save(existing);
    }

    @Test
    void getSessionById_returnsExistingSession() {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        ScheduledSession existing = new ScheduledSession();
        existing.setId(UUID.randomUUID());
        existing.setSessionId(sessionId);
        existing.setSeriesName("Yoga Basics");
        existing.setStartTime(LocalDateTime.of(2025, 9, 26, 9, 0));
        existing.setEndTime(LocalDateTime.of(2025, 9, 26, 10, 0));
        existing.setTrainerId(trainerId);

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(existing));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(studentCommitmentRepository.findBySessionSeriesId(any())).thenReturn(List.of());

        // Act
        SessionResponseDTO result = scheduleService.getSessionById(sessionId);

        // Assert
        assertNotNull(result);
        assertEquals(sessionId, result.sessionId());
        assertEquals("Yoga Basics", result.seriesName());
    }

    @Test
    void getSessionById_generatesFromSchedule_whenNotPersisted() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        LocalTime start = LocalTime.of(9, 0);
        int intervalMinutes = 60;
        TrainerSchedule schedule = buildSchedule(UUID.randomUUID(), trainerId, "Yoga Basics", start, intervalMinutes);
        String sessionId = "yoga-basics__" + date + "__09:00__" + trainerId;

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.empty());
        when(scheduledSessionRepository.findByStartTimeBetweenAndActiveTrue(any(), any())).thenReturn(List.of());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(schedule));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(studentCommitmentRepository.findBySessionSeriesId(schedule.getId())).thenReturn(List.of());

        // Act
        SessionResponseDTO result = scheduleService.getSessionById(sessionId);

        // Assert
        assertNotNull(result);
        assertEquals(sessionId, result.sessionId());
        assertEquals("Yoga Basics", result.seriesName());
        assertFalse(result.instanceOverride());
    }

    @Test
    void getSessionById_resolvesLegacy3PartId() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        LocalTime start = LocalTime.of(9, 0);
        TrainerSchedule schedule = buildSchedule(UUID.randomUUID(), trainerId, "Yoga Basics", start, 60);
        String legacyId = "yoga-basics__" + date + "__09:00";

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(legacyId)).thenReturn(Optional.empty());
        when(scheduledSessionRepository.findByStartTimeBetweenAndActiveTrue(any(), any())).thenReturn(List.of());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(schedule));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(studentCommitmentRepository.findBySessionSeriesId(schedule.getId())).thenReturn(List.of());

        // Act
        SessionResponseDTO result = scheduleService.getSessionById(legacyId);

        // Assert
        assertNotNull(result);
        // Should return canonical ID even if requested with legacy ID
        String expectedCanonical = "yoga-basics__" + date + "__09:00__" + trainerId;
        assertEquals(expectedCanonical, result.sessionId());
    }

    @Test
    void getSessionById_disambiguatesWithTrainerId() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        LocalTime start = LocalTime.of(9, 0);
        UUID trainer2Id = UUID.randomUUID();
        TrainerSchedule s1 = buildSchedule(UUID.randomUUID(), trainerId, "Yoga Basics", start, 60);
        TrainerSchedule s2 = buildSchedule(UUID.randomUUID(), trainer2Id, "Yoga Advanced", start, 60);
        
        String ambiguousId = "yoga__" + date + "__09:00"; // Ambiguous slug "yoga" matches both "Yoga Basics" and "Yoga Advanced" prefix

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(ambiguousId)).thenReturn(Optional.empty());
        when(scheduledSessionRepository.findByStartTimeBetweenAndActiveTrue(any(), any())).thenReturn(List.of());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(s1, s2));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(studentCommitmentRepository.findBySessionSeriesId(s1.getId())).thenReturn(List.of());

        // Act
        SessionResponseDTO result = scheduleService.getSessionById(ambiguousId, trainerId);

        // Assert
        assertNotNull(result);
        assertEquals("Yoga Basics", result.seriesName());
        assertEquals(trainerId, result.trainerId());
    }

    @Test
    void getSessionById_throwsOnAmbiguity() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        LocalTime start = LocalTime.of(9, 0);
        UUID trainer2Id = UUID.randomUUID();
        TrainerSchedule s1 = buildSchedule(UUID.randomUUID(), trainerId, "Yoga Basics", start, 60);
        TrainerSchedule s2 = buildSchedule(UUID.randomUUID(), trainer2Id, "Yoga Advanced", start, 60);
        
        String ambiguousId = "yoga__" + date + "__09:00";

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(ambiguousId)).thenReturn(Optional.empty());
        when(scheduledSessionRepository.findByStartTimeBetweenAndActiveTrue(any(), any())).thenReturn(List.of());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(s1, s2));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> scheduleService.getSessionById(ambiguousId));
    }

    @Test
    void getStudentCommitmentsForSession_handlesExcludedOverride() {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        ScheduledSession existing = new ScheduledSession();
        existing.setId(UUID.randomUUID());
        existing.setSessionId(sessionId);
        existing.setSessionSeriesId(UUID.randomUUID());
        existing.setStartTime(LocalDateTime.now());
        
        UUID studentId = UUID.randomUUID();
        StudentCommitment commitment = new StudentCommitment();
        commitment.setStudentId(studentId);
        commitment.setCommitmentStatus(CommitmentStatus.ATTENDING);
        commitment.setEffectiveFromTimestamp(Instant.now().minus(Duration.ofDays(10)));

        SessionParticipant excluded = new SessionParticipant();
        excluded.setStudentId(studentId);
        excluded.setParticipationType(SessionParticipant.ParticipationType.EXCLUDED);

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(existing));
        when(studentCommitmentRepository.findBySessionSeriesId(existing.getSessionSeriesId())).thenReturn(List.of(commitment));
        when(sessionParticipantRepository.findByScheduledSession_IdAndActiveTrue(existing.getId())).thenReturn(List.of(excluded));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(mock(Student.class)));

        // Act
        SessionResponseDTO result = scheduleService.getSessionById(sessionId);

        // Assert
        assertTrue(result.students().isEmpty());
    }

    @Test
    void getStudentCommitmentsForSession_handlesIncludedOverride() {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        ScheduledSession existing = new ScheduledSession();
        existing.setId(UUID.randomUUID());
        existing.setSessionId(sessionId);
        existing.setSessionSeriesId(UUID.randomUUID());
        existing.setStartTime(LocalDateTime.now());
        
        UUID studentId = UUID.randomUUID();
        // No commitment for this student

        SessionParticipant included = new SessionParticipant();
        included.setId(UUID.randomUUID());
        included.setStudentId(studentId);
        included.setParticipationType(SessionParticipant.ParticipationType.INCLUDED);
        included.setPresent(true);

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(existing));
        when(studentCommitmentRepository.findBySessionSeriesId(existing.getSessionSeriesId())).thenReturn(List.of());
        when(sessionParticipantRepository.findByScheduledSession_IdAndActiveTrue(existing.getId())).thenReturn(List.of(included));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(mock(Student.class)));
        when(participantExerciseRepository.findActiveWithExerciseBySessionParticipantId(included.getId())).thenReturn(List.of());

        // Act
        SessionResponseDTO result = scheduleService.getSessionById(sessionId);

        // Assert
        assertEquals(1, result.students().size());
        assertEquals(studentId, result.students().get(0).studentId());
        assertTrue(result.students().get(0).present());
    }

    @Test
    void updateParticipantPresence_implicitlyAddsParticipant() {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        ScheduledSession existing = new ScheduledSession();
        existing.setId(UUID.randomUUID());
        existing.setSessionId(sessionId);
        UUID studentId = UUID.randomUUID();

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(existing));
        // First call returns empty (not found)
        when(sessionParticipantRepository.findByScheduledSession_IdAndStudentIdAndActiveTrue(existing.getId(), studentId))
                .thenReturn(new ArrayList<>())
                .thenReturn(List.of(new SessionParticipant())); // Second call returns the newly added one (mocked)
        
        when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        
        // Mock addParticipant behavior partially
        when(sessionParticipantRepository.save(any(SessionParticipant.class))).thenAnswer(invocation -> {
            SessionParticipant sp = invocation.getArgument(0);
            sp.setParticipationType(SessionParticipant.ParticipationType.INCLUDED); // Simulate what addParticipant does
            return sp;
        });

        // Act
        scheduleService.updateParticipantPresence(sessionId, studentId, true, "Late");

        // Assert
        // Verify addParticipant logic was triggered (save called with INCLUDED)
        verify(sessionParticipantRepository, atLeastOnce()).save(argThat(sp -> sp.getStudentId().equals(studentId) && sp.isIncluded()));
    }

    @Test
    void addParticipantExercise_implicitlyAddsParticipant() {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        ScheduledSession existing = new ScheduledSession();
        existing.setId(UUID.randomUUID());
        existing.setSessionId(sessionId);
        UUID studentId = UUID.randomUUID();
        ParticipantExerciseCreateRequestDTO req = new ParticipantExerciseCreateRequestDTO(UUID.randomUUID(), 1, 1, 1.0, "Note", true);

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(existing));
        // First call returns empty
        when(sessionParticipantRepository.findByScheduledSession_IdAndStudentIdAndActiveTrue(existing.getId(), studentId))
                .thenReturn(new ArrayList<>())
                .thenReturn(List.of(new SessionParticipant())); // Second call returns new one

        when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(participantExerciseRepository.save(any(ParticipantExercise.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        scheduleService.addParticipantExercise(sessionId, studentId, req);

        // Assert
        verify(sessionParticipantRepository, atLeastOnce()).save(argThat(sp -> sp.getStudentId().equals(studentId) && sp.isIncluded()));
        verify(participantExerciseRepository).save(any(ParticipantExercise.class));
    }

    @Test
    void getScheduledSessions_includesStandaloneSessions() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        LocalDateTime start = LocalDateTime.of(date, LocalTime.of(10, 0));
        LocalDateTime end = LocalDateTime.of(date, LocalTime.of(11, 0));
        
        ScheduledSession standalone = new ScheduledSession();
        standalone.setId(UUID.randomUUID());
        standalone.setSessionId("oneoff__" + date + "__10:00");
        standalone.setStartTime(start);
        standalone.setEndTime(end);
        standalone.setSeriesName("Standalone Event");
        standalone.setInstanceOverride(true);
        
        when(scheduledSessionRepository.findByStartTimeBetweenAndActiveTrue(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(standalone));
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of());
        when(studentCommitmentRepository.findBySessionSeriesId(any())).thenReturn(List.of());

        // Act
        List<SessionResponseDTO> sessions = scheduleService.getScheduledSessions(date, date);

        // Assert
        assertEquals(1, sessions.size());
        assertEquals("Standalone Event", sessions.get(0).seriesName());
        assertTrue(sessions.get(0).instanceOverride());
    }

    @Test
    void getOrCreateSessionInstance_resolvesAmbiguousSlug_ExactMatch() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        LocalTime time = LocalTime.of(9, 0);
        TrainerSchedule s1 = buildSchedule(UUID.randomUUID(), trainerId, "Yoga Basics", time, 60);
        TrainerSchedule s2 = buildSchedule(UUID.randomUUID(), UUID.randomUUID(), "Yoga Advanced", time, 60);
        
        // Slug "yoga-basics" matches s1 exactly
        String ambiguousId = "yoga-basics__" + date + "__09:00";

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(ambiguousId)).thenReturn(Optional.empty());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(s1, s2));
        when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(invocation -> {
            ScheduledSession s = invocation.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        // Act
        // Trigger getOrCreateSessionInstance via updateSessionNotes
        scheduleService.updateSessionNotes(ambiguousId, "Notes");

        // Assert
        ArgumentCaptor<ScheduledSession> captor = ArgumentCaptor.forClass(ScheduledSession.class);
        verify(scheduledSessionRepository, atLeastOnce()).save(captor.capture());
        // The first save is inside getOrCreateSessionInstance, the second is inside updateSessionNotes
        // We just want to ensure one of them (the one created) has the correct series name
        assertEquals("Yoga Basics", captor.getAllValues().get(0).getSeriesName());
    }

    @Test
    void getOrCreateSessionInstance_resolvesAmbiguousSlug_PrefixMatch() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        LocalTime time = LocalTime.of(9, 0);
        TrainerSchedule s1 = buildSchedule(UUID.randomUUID(), trainerId, "Yoga Basics", time, 60);
        TrainerSchedule s2 = buildSchedule(UUID.randomUUID(), UUID.randomUUID(), "Pilates", time, 60);
        
        // Slug "yoga" is a prefix of "Yoga Basics" but not "Pilates"
        String ambiguousId = "yoga__" + date + "__09:00";

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(ambiguousId)).thenReturn(Optional.empty());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(s1, s2));
        when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(invocation -> {
            ScheduledSession s = invocation.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        // Act
        scheduleService.updateSessionNotes(ambiguousId, "Notes");

        // Assert
        ArgumentCaptor<ScheduledSession> captor = ArgumentCaptor.forClass(ScheduledSession.class);
        verify(scheduledSessionRepository, atLeastOnce()).save(captor.capture());
        assertEquals("Yoga Basics", captor.getAllValues().get(0).getSeriesName());
    }

    @Test
    void getOrCreateSessionInstance_throwsOnAmbiguousSlug_MultipleCandidates() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        LocalTime time = LocalTime.of(9, 0);
        TrainerSchedule s1 = buildSchedule(UUID.randomUUID(), trainerId, "Yoga Basics", time, 60);
        TrainerSchedule s2 = buildSchedule(UUID.randomUUID(), UUID.randomUUID(), "Yoga Advanced", time, 60);
        
        // Slug "yoga" matches both as prefix
        String ambiguousId = "yoga__" + date + "__09:00";

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(ambiguousId)).thenReturn(Optional.empty());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(s1, s2));

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            scheduleService.updateSessionNotes(ambiguousId, "Notes");
        });
        // The exception is wrapped, so we check the cause or the outer message
        // Outer message: "Could not create session instance for sessionId: ..."
        // Inner message: "Ambiguous session slug/time..."
        assertTrue(ex.getMessage().contains("Could not create session instance") || 
                   (ex.getCause() != null && ex.getCause().getMessage().contains("Ambiguous session slug/time")));
    }

    @Test
    void getOrCreateSessionInstance_fallback_findsRenamedSeries() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        LocalTime time = LocalTime.of(9, 0);
        String oldSlug = "old-name";
        String sessionId = oldSlug + "__" + date + "__" + time;
        
        TrainerSchedule schedule = buildSchedule(UUID.randomUUID(), trainerId, "New Name", time, 60);
        
        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.empty());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
            .thenReturn(List.of(schedule));
        when(scheduledSessionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Act
        // We can't call private method directly, so we call updateSessionNotes which calls it
        scheduleService.updateSessionNotes(sessionId, "Notes");

        // Assert
        ArgumentCaptor<ScheduledSession> captor = ArgumentCaptor.forClass(ScheduledSession.class);
        verify(scheduledSessionRepository, atLeastOnce()).save(captor.capture());
        ScheduledSession saved = captor.getAllValues().get(0);
        assertEquals(schedule.getId(), saved.getSessionSeriesId());
        // It should save with the NEW canonical ID
        assertTrue(saved.getSessionId().contains("new-name"));
    }

    @Test
    void getStudentCommitmentsForSession_handlesOverrides() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        LocalTime start = LocalTime.of(9, 0);
        TrainerSchedule schedule = buildSchedule(UUID.randomUUID(), trainerId, "Yoga", start, 60);
        
        // Existing session with overrides
        ScheduledSession session = buildExistingSession(UUID.randomUUID(), "yoga__"+date+"__09:00", schedule.getId(), trainerId, date, start, start.plusMinutes(60), "", true);
        
        UUID studentExcluded = UUID.randomUUID();
        UUID studentIncluded = UUID.randomUUID();
        
        // Commitments: studentExcluded has commitment, studentIncluded does not
        StudentCommitment c1 = new StudentCommitment();
        c1.setStudentId(studentExcluded);
        c1.setSessionSeriesId(schedule.getId());
        c1.setCommitmentStatus(CommitmentStatus.ATTENDING);
        c1.setEffectiveFromTimestamp(Instant.now().minusSeconds(100));
        
        when(studentCommitmentRepository.findBySessionSeriesId(schedule.getId())).thenReturn(List.of(c1));
        
        // Overrides
        SessionParticipant spExcluded = new SessionParticipant();
        spExcluded.setStudentId(studentExcluded);
        spExcluded.setParticipationType(SessionParticipant.ParticipationType.EXCLUDED);
        
        SessionParticipant spIncluded = new SessionParticipant();
        spIncluded.setStudentId(studentIncluded);
        spIncluded.setParticipationType(SessionParticipant.ParticipationType.INCLUDED);
        spIncluded.setPresent(true);
        spIncluded.setId(UUID.randomUUID());
        
        when(sessionParticipantRepository.findByScheduledSession_IdAndActiveTrue(session.getId()))
            .thenReturn(List.of(spExcluded, spIncluded));
            
        when(scheduledSessionRepository.findByStartTimeBetweenAndActiveTrue(any(), any()))
            .thenReturn(List.of(session));
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any()))
            .thenReturn(List.of(schedule));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        
        when(studentRepository.findById(studentIncluded)).thenReturn(Optional.of(mock(Student.class)));
        when(participantExerciseRepository.findActiveWithExerciseBySessionParticipantId(any())).thenReturn(List.of());

        // Act
        List<SessionResponseDTO> sessions = scheduleService.getScheduledSessions(date, date);
        
        // Assert
        assertEquals(1, sessions.size());
        List<org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentCommitmentResponseDTO> students = sessions.get(0).students();
        
        // studentExcluded should be absent (excluded)
        assertTrue(students.stream().noneMatch(s -> s.studentId().equals(studentExcluded)));
        
        // studentIncluded should be present (included)
        assertTrue(students.stream().anyMatch(s -> s.studentId().equals(studentIncluded)));
    }

    @Test
    void getOrCreateSessionInstance_canonicalId_createsSession() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        LocalTime time = LocalTime.of(9, 0);
        UUID seriesId = UUID.randomUUID();
        TrainerSchedule schedule = buildSchedule(seriesId, trainerId, "Yoga", time, 60);
        
        // Canonical ID: slug__date__time__trainerId
        String canonicalId = "yoga__" + date + "__09:00__" + trainerId;
        
        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(canonicalId)).thenReturn(Optional.empty());
        // It should look up by weekday first
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(
                anyInt(), any(Instant.class)))
            .thenReturn(List.of(schedule));
            
        when(scheduledSessionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Act
        scheduleService.updateSessionNotes(canonicalId, "Notes");

        // Assert
        ArgumentCaptor<ScheduledSession> captor = ArgumentCaptor.forClass(ScheduledSession.class);
        verify(scheduledSessionRepository, atLeastOnce()).save(captor.capture());
        ScheduledSession saved = captor.getAllValues().get(0);
        assertEquals(seriesId, saved.getSessionSeriesId());
        assertEquals(canonicalId, saved.getSessionId());
    }

    @Test
    void getOrCreateSessionInstance_legacyId_createsSessionWithCanonicalId() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        LocalTime time = LocalTime.of(9, 0);
        UUID seriesId = UUID.randomUUID();
        TrainerSchedule schedule = buildSchedule(seriesId, trainerId, "Yoga", time, 60);
        
        // Legacy ID: slug__date__time
        String legacyId = "yoga__" + date + "__09:00";
        // Canonical ID: slug__date__time__trainerId
        String canonicalId = "yoga__" + date + "__09:00__" + trainerId;
        
        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(legacyId)).thenReturn(Optional.empty());
        
        // It should look up by weekday
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(
                anyInt(), any(Instant.class)))
            .thenReturn(List.of(schedule));
            
        when(scheduledSessionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Act
        scheduleService.updateSessionNotes(legacyId, "Notes");

        // Assert
        ArgumentCaptor<ScheduledSession> captor = ArgumentCaptor.forClass(ScheduledSession.class);
        verify(scheduledSessionRepository, atLeastOnce()).save(captor.capture());
        ScheduledSession saved = captor.getAllValues().get(0);
        assertEquals(seriesId, saved.getSessionSeriesId());
        // It should save with the CANONICAL ID, even if requested with legacy ID
        assertEquals(canonicalId, saved.getSessionId());
    }

    @Test
    void getOrCreateSessionInstance_throwsOnMalformedId_BadFormat() {
        // Arrange
        String badId = "not-enough-parts";
        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(badId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            scheduleService.updateSessionNotes(badId, "Notes");
        });
        assertTrue(ex.getMessage().contains("Could not create session instance"));
    }

    @Test
    void getOrCreateSessionInstance_throwsOnMalformedId_BadDate() {
        // Arrange
        String badId = "slug__not-a-date__09:00";
        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(badId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            scheduleService.updateSessionNotes(badId, "Notes");
        });
        assertTrue(ex.getMessage().contains("Could not create session instance"));
        assertNotNull(ex.getCause()); // Should have cause from parsing error
    }

    @Test
    void getOrCreateSessionInstance_throwsOnNotFound() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        String id = "slug__" + date + "__09:00";
        
        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(id)).thenReturn(Optional.empty());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any()))
            .thenReturn(List.of()); // No schedules found

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            scheduleService.updateSessionNotes(id, "Notes");
        });
        // Should fall through to the end of the method where it throws "Could not create session instance"
        // because no schedule matched and no timeMatches were found.
        assertTrue(ex.getMessage().contains("Could not create session instance"));
    }

    @Test
    void updateSessionParticipants_updatesParticipants() {
        // Arrange
        String sessionId = "yoga__2025-09-26__09:00__" + trainerId;
        ScheduledSession session = new ScheduledSession();
        session.setId(UUID.randomUUID());
        session.setSessionId(sessionId);
        
        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(session));
        
        SessionParticipant oldParticipant = mock(SessionParticipant.class);
        when(sessionParticipantRepository.findByScheduledSession_IdAndActiveTrue(session.getId()))
            .thenReturn(List.of(oldParticipant));
            
        SessionParticipant newParticipant = new SessionParticipant();
        newParticipant.setStudentId(UUID.randomUUID());
        
        // Act
        scheduleService.updateSessionParticipants(sessionId, List.of(newParticipant));
        
        // Assert
        verify(oldParticipant).softDelete();
        verify(sessionParticipantRepository).save(oldParticipant);
        verify(sessionParticipantRepository).save(newParticipant);
        assertEquals(session, newParticipant.getScheduledSession());
        assertTrue(session.isInstanceOverride());
        verify(scheduledSessionRepository).save(session);
    }

    @Test
    @DisplayName("getSessionById: Should throw exception for invalid session ID format")
    void getSessionById_InvalidFormat() {
        RuntimeException exception = assertThrows(RuntimeException.class, () -> scheduleService.getSessionById("invalid-id"));
        assertTrue(exception.getMessage().contains("Invalid sessionId format"));
    }

    @Test
    @DisplayName("getSessionById: Should resolve lazy session with 3-part ID")
    void getSessionById_LazyResolve_3PartId() {
        LocalDate date = LocalDate.of(2025, 10, 1);
        LocalTime time = LocalTime.of(10, 0);
        String sessionId = "yoga-basics__" + date + "__" + time;

        TrainerSchedule schedule = new TrainerSchedule();
        schedule.setId(UUID.randomUUID());
        schedule.setTrainerId(trainerId);
        schedule.setSeriesName("Yoga Basics");
        schedule.setStartTime(time);
        schedule.setIntervalDuration(60);
        schedule.setEffectiveFromTimestamp(Instant.now().minus(Duration.ofDays(1)));

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.empty());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(schedule));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));

        SessionResponseDTO result = scheduleService.getSessionById(sessionId);

        assertNotNull(result);
        assertTrue(result.sessionId().contains(trainerId.toString())); // Canonical ID should be generated
        assertEquals("John Trainer", result.trainerName());
    }

    @Test
    @DisplayName("getSessionById: Should resolve lazy session with 4-part ID")
    void getSessionById_LazyResolve_4PartId() {
        LocalDate date = LocalDate.of(2025, 10, 1);
        LocalTime time = LocalTime.of(10, 0);
        String sessionId = "yoga-basics__" + date + "__" + time + "__" + trainerId;

        TrainerSchedule schedule = new TrainerSchedule();
        schedule.setId(UUID.randomUUID());
        schedule.setTrainerId(trainerId);
        schedule.setSeriesName("Yoga Basics");
        schedule.setStartTime(time);
        schedule.setIntervalDuration(60);
        schedule.setEffectiveFromTimestamp(Instant.now().minus(Duration.ofDays(1)));

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.empty());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(schedule));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));

        SessionResponseDTO result = scheduleService.getSessionById(sessionId);

        assertNotNull(result);
        assertEquals(sessionId, result.sessionId());
    }

    @Test
    @DisplayName("getSessionById: Should disambiguate using provided trainer ID in 4-part ID")
    void getSessionById_DisambiguateWithProvidedTrainerId() {
        LocalDate date = LocalDate.of(2025, 10, 1);
        LocalTime time = LocalTime.of(10, 0);
        String sessionId = "yoga__" + date + "__" + time + "__" + trainerId;

        TrainerSchedule schedule1 = new TrainerSchedule();
        schedule1.setId(UUID.randomUUID());
        schedule1.setTrainerId(trainerId); // Matches
        schedule1.setSeriesName("Yoga Advanced");
        schedule1.setStartTime(time);
        schedule1.setIntervalDuration(60);
        schedule1.setEffectiveFromTimestamp(Instant.now().minus(Duration.ofDays(1)));

        TrainerSchedule schedule2 = new TrainerSchedule();
        schedule2.setId(UUID.randomUUID());
        schedule2.setTrainerId(UUID.randomUUID()); // Different trainer
        schedule2.setSeriesName("Yoga Beginner");
        schedule2.setStartTime(time);
        schedule2.setIntervalDuration(60);
        schedule2.setEffectiveFromTimestamp(Instant.now().minus(Duration.ofDays(1)));

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.empty());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(schedule1, schedule2));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));

        SessionResponseDTO result = scheduleService.getSessionById(sessionId);

        assertNotNull(result);
        assertEquals(trainerId, result.trainerId());
        assertEquals("Yoga Advanced", result.seriesName());
    }

    @Test
    @DisplayName("getSessionById: Should throw exception when ambiguous slug")
    void getSessionById_AmbiguousSlug() {
        LocalDate date = LocalDate.of(2025, 10, 1);
        LocalTime time = LocalTime.of(10, 0);
        String sessionId = "yoga__" + date + "__" + time;

        TrainerSchedule schedule1 = new TrainerSchedule();
        schedule1.setId(UUID.randomUUID());
        schedule1.setTrainerId(trainerId);
        schedule1.setSeriesName("Yoga Advanced");
        schedule1.setStartTime(time);
        schedule1.setIntervalDuration(60);
        schedule1.setEffectiveFromTimestamp(Instant.now().minus(Duration.ofDays(1)));

        TrainerSchedule schedule2 = new TrainerSchedule();
        schedule2.setId(UUID.randomUUID());
        schedule2.setTrainerId(trainerId);
        schedule2.setSeriesName("Yoga Beginner");
        schedule2.setStartTime(time);
        schedule2.setIntervalDuration(60);
        schedule2.setEffectiveFromTimestamp(Instant.now().minus(Duration.ofDays(1)));

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.empty());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(schedule1, schedule2));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> scheduleService.getSessionById(sessionId));
        assertNotNull(exception.getCause());
        assertTrue(exception.getCause().getMessage().contains("Ambiguous session slug/time"));
    }

    @Test
    @DisplayName("getSessionById: Should resolve using prefix match")
    void getSessionById_PrefixMatch() {
        LocalDate date = LocalDate.of(2025, 10, 1);
        LocalTime time = LocalTime.of(10, 0);
        String sessionId = "yoga__" + date + "__" + time;

        TrainerSchedule schedule1 = new TrainerSchedule();
        schedule1.setId(UUID.randomUUID());
        schedule1.setTrainerId(trainerId);
        schedule1.setSeriesName("Yoga Advanced"); // Starts with "yoga"
        schedule1.setStartTime(time);
        schedule1.setIntervalDuration(60);
        schedule1.setEffectiveFromTimestamp(Instant.now().minus(Duration.ofDays(1)));

        // schedule2 does not match prefix
        TrainerSchedule schedule2 = new TrainerSchedule();
        schedule2.setId(UUID.randomUUID());
        schedule2.setTrainerId(trainerId);
        schedule2.setSeriesName("Pilates");
        schedule2.setStartTime(time);
        schedule2.setIntervalDuration(60);
        schedule2.setEffectiveFromTimestamp(Instant.now().minus(Duration.ofDays(1)));

        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.empty());
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(schedule1, schedule2));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));

        SessionResponseDTO result = scheduleService.getSessionById(sessionId);

        assertNotNull(result);
        assertEquals("Yoga Advanced", result.seriesName());
    }
    
    @Test
    @DisplayName("getSessionById: Should return existing persisted session if found")
    void getSessionById_ExistingPersistedSession() {
        String sessionId = "existing-session-id";
        ScheduledSession existingSession = new ScheduledSession();
        existingSession.setSessionId(sessionId);
        existingSession.setTrainerId(trainerId);
        existingSession.setStartTime(LocalDateTime.now());
        existingSession.setEndTime(LocalDateTime.now().plusHours(1));
        existingSession.setSeriesName("Existing Series");
        
        when(scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.of(existingSession));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        
        SessionResponseDTO result = scheduleService.getSessionById(sessionId);
        
        assertNotNull(result);
        assertEquals(sessionId, result.sessionId());
        assertEquals("Existing Series", result.seriesName());
    }

    @Test
    @DisplayName("getScheduledSessions: Should include standalone sessions not matching any schedule")
    void getScheduledSessions_StandaloneSessions() {
        LocalDate startDate = LocalDate.of(2025, 10, 1);
        LocalDate endDate = LocalDate.of(2025, 10, 1);
        
        ScheduledSession standaloneSession = new ScheduledSession();
        standaloneSession.setSessionId("oneoff__2025-10-01__10:00");
        standaloneSession.setTrainerId(trainerId);
        standaloneSession.setStartTime(LocalDateTime.of(startDate, LocalTime.of(10, 0)));
        standaloneSession.setEndTime(LocalDateTime.of(startDate, LocalTime.of(11, 0)));
        standaloneSession.setSeriesName("One-off Session");
        standaloneSession.setInstanceOverride(true);
        
        when(scheduledSessionRepository.findByStartTimeBetweenAndActiveTrue(any(), any()))
                .thenReturn(List.of(standaloneSession));
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(Collections.emptyList());
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        
        List<SessionResponseDTO> result = scheduleService.getScheduledSessions(startDate, endDate);
        
        assertEquals(1, result.size());
        assertEquals("oneoff__2025-10-01__10:00", result.get(0).sessionId());
        assertEquals("One-off Session", result.get(0).seriesName());
    }

    @Test
    @DisplayName("getScheduledSessions: Should avoid duplicates when standalone session matches generated schedule")
    void getScheduledSessions_AvoidDuplicates() {
        LocalDate startDate = LocalDate.of(2025, 10, 1);
        LocalDate endDate = LocalDate.of(2025, 10, 1);
        LocalTime time = LocalTime.of(10, 0);
        
        // Generated schedule
        TrainerSchedule schedule = new TrainerSchedule();
        schedule.setId(UUID.randomUUID());
        schedule.setTrainerId(trainerId);
        schedule.setSeriesName("Yoga Basics");
        schedule.setStartTime(time);
        schedule.setIntervalDuration(60);
        schedule.setEffectiveFromTimestamp(Instant.now().minus(Duration.ofDays(1)));
        
        // Persisted session that matches the generated one (same ID)
        String sessionId = "yoga-basics__" + startDate + "__" + time + "__" + trainerId;
        ScheduledSession persistedSession = new ScheduledSession();
        persistedSession.setSessionId(sessionId);
        persistedSession.setTrainerId(trainerId);
        persistedSession.setStartTime(LocalDateTime.of(startDate, time));
        persistedSession.setEndTime(LocalDateTime.of(startDate, time.plusHours(1)));
        persistedSession.setSeriesName("Yoga Basics");
        persistedSession.setInstanceOverride(true); // Modified
        
        when(scheduledSessionRepository.findByStartTimeBetweenAndActiveTrue(any(), any()))
                .thenReturn(List.of(persistedSession));
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(schedule));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        
        List<SessionResponseDTO> result = scheduleService.getScheduledSessions(startDate, endDate);
        
        // Should only return 1 session (the persisted one, which overrides the generated one)
        assertEquals(1, result.size());
        assertEquals(sessionId, result.get(0).sessionId());
        assertTrue(result.get(0).instanceOverride());
    }
    
    @Test
    @DisplayName("getScheduledSessions: Should avoid duplicates when standalone session matches legacy ID")
    void getScheduledSessions_AvoidDuplicates_LegacyId() {
        LocalDate startDate = LocalDate.of(2025, 10, 1);
        LocalDate endDate = LocalDate.of(2025, 10, 1);
        LocalTime time = LocalTime.of(10, 0);
        
        // Generated schedule
        TrainerSchedule schedule = new TrainerSchedule();
        schedule.setId(UUID.randomUUID());
        schedule.setTrainerId(trainerId);
        schedule.setSeriesName("Yoga Basics");
        schedule.setStartTime(time);
        schedule.setIntervalDuration(60);
        schedule.setEffectiveFromTimestamp(Instant.now().minus(Duration.ofDays(1)));
        
        // Persisted session with LEGACY ID format (3 parts)
        String legacyId = "yoga-basics__" + startDate + "__" + time;
        ScheduledSession persistedSession = new ScheduledSession();
        persistedSession.setSessionId(legacyId);
        persistedSession.setTrainerId(trainerId);
        persistedSession.setStartTime(LocalDateTime.of(startDate, time));
        persistedSession.setEndTime(LocalDateTime.of(startDate, time.plusHours(1)));
        persistedSession.setSeriesName("Yoga Basics");
        persistedSession.setInstanceOverride(true);
        
        when(scheduledSessionRepository.findByStartTimeBetweenAndActiveTrue(any(), any()))
                .thenReturn(List.of(persistedSession));
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(schedule));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        
        List<SessionResponseDTO> result = scheduleService.getScheduledSessions(startDate, endDate);
        
        // Should only return 1 session
        assertEquals(1, result.size());
        
        // The service returns the CANONICAL ID (4 parts) even if the persisted session has a legacy ID,
        // because it matches a schedule.
        String canonicalId = "yoga-basics__" + startDate + "__" + time + "__" + trainerId;
        assertEquals(canonicalId, result.get(0).sessionId());
        assertTrue(result.get(0).instanceOverride());
    }
}

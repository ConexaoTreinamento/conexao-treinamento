package org.conexaotreinamento.conexaotreinamentobackend.unit.service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.SessionResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.ScheduledSession;
import org.conexaotreinamento.conexaotreinamentobackend.entity.SessionParticipant;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.repository.ScheduledSessionRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.SessionParticipantRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentCommitmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerScheduleRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.ScheduleService;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

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
        when(scheduledSessionRepository.findByStartTimeBetweenAndIsActiveTrue(any(LocalDateTime.class), any(LocalDateTime.class)))
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

        when(scheduledSessionRepository.findByStartTimeBetweenAndIsActiveTrue(any(LocalDateTime.class), any(LocalDateTime.class)))
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
        when(scheduledSessionRepository.findByStartTimeBetweenAndIsActiveTrue(any(LocalDateTime.class), any(LocalDateTime.class)))
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

        when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)).thenReturn(Optional.of(existing));
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

        when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)).thenReturn(Optional.of(existing));
        when(sessionParticipantRepository.findByScheduledSession_IdAndIsActiveTrue(existingSessionId)).thenReturn(List.of(oldP));
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
        when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(badId)).thenReturn(Optional.empty());

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

        when(scheduledSessionRepository.findByStartTimeBetweenAndIsActiveTrue(any(LocalDateTime.class), any(LocalDateTime.class)))
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
void getScheduledSessions_includesStandalonePersistedSessions() {
    // Arrange
    LocalDate date = LocalDate.of(2025, 9, 26);
    
    // No schedules from trainer schedule
    when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
            .thenReturn(List.of());
    
    // But there's a standalone session (one-off)
    ScheduledSession standalone = buildExistingSession(
        UUID.randomUUID(), 
        "oneoff__2025-09-26__14:00", 
        null, 
        trainerId, 
        date, 
        LocalTime.of(14, 0), 
        LocalTime.of(15, 0), 
        "Special event", 
        true
    );
    
    when(scheduledSessionRepository.findByStartTimeBetweenAndIsActiveTrue(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(List.of(standalone));
    when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
    when(studentCommitmentRepository.findBySessionSeriesId(any())).thenReturn(List.of());

    // Act
    List<SessionResponseDTO> sessions = scheduleService.getScheduledSessions(date, date);

    // Assert
    assertEquals(1, sessions.size());
    assertEquals("oneoff__2025-09-26__14:00", sessions.get(0).sessionId());
    assertEquals("Special event", sessions.get(0).notes());
}

@Test
void getSessionById_returnsExistingInstance() {
    // Arrange
    String sessionId = "yoga__2025-09-26__09:00__" + trainerId;
    UUID scheduleId = UUID.randomUUID();
    
    ScheduledSession existing = buildExistingSession(
        UUID.randomUUID(), 
        sessionId, 
        scheduleId, 
        trainerId, 
        LocalDate.of(2025, 9, 26), 
        LocalTime.of(9, 0), 
        LocalTime.of(10, 0), 
        "Test notes", 
        true
    );

    when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)).thenReturn(Optional.of(existing));
    when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
    when(studentCommitmentRepository.findBySessionSeriesId(scheduleId)).thenReturn(List.of());

    // Act
    SessionResponseDTO result = scheduleService.getSessionById(sessionId);

    // Assert
    assertNotNull(result);
    assertEquals(sessionId, result.sessionId());
    assertEquals("Test notes", result.notes());
    assertEquals("John Trainer", result.trainerName());
}

@Test
void getSessionById_resolvesFromScheduleWhenNoInstance() {
    // Arrange
    LocalDate date = LocalDate.of(2025, 9, 26);
    LocalTime time = LocalTime.of(9, 0);
    UUID scheduleId = UUID.randomUUID();
    String sessionId = "yoga__" + date + "__" + time + "__" + trainerId;
    
    TrainerSchedule schedule = buildSchedule(scheduleId, trainerId, "Yoga", time, 60);

    when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)).thenReturn(Optional.empty());
    when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
            .thenReturn(List.of(schedule));
    when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
    when(studentCommitmentRepository.findBySessionSeriesId(scheduleId)).thenReturn(List.of());

    // Act
    SessionResponseDTO result = scheduleService.getSessionById(sessionId);

    // Assert
    assertNotNull(result);
    assertEquals(sessionId, result.sessionId());
    assertEquals("John Trainer", result.trainerName());
    assertFalse(result.instanceOverride());
}

@Test
void getSessionById_throwsWhenCannotResolve() {
    // Arrange
    String sessionId = "unknown__2025-09-26__09:00__" + trainerId;

    when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)).thenReturn(Optional.empty());
    when(scheduledSessionRepository.findByStartTimeBetweenAndIsActiveTrue(any(), any())).thenReturn(List.of());
    when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
            .thenReturn(List.of());

    // Act & Assert
    assertThrows(RuntimeException.class, () -> scheduleService.getSessionById(sessionId));
}

@Test
void updateSessionTrainer_updatesTrainerAndMarksOverride() {
    // Arrange
    String sessionId = "yoga__2025-09-26__09:00";
    UUID newTrainerId = UUID.randomUUID();
    
    ScheduledSession existing = new ScheduledSession();
    existing.setId(UUID.randomUUID());
    existing.setSessionId(sessionId);
    existing.setTrainerId(trainerId);
    existing.setInstanceOverride(false);

    when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)).thenReturn(Optional.of(existing));
    when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(inv -> inv.getArgument(0));

    // Act
    scheduleService.updateSessionTrainer(sessionId, newTrainerId);

    // Assert
    ArgumentCaptor<ScheduledSession> captor = ArgumentCaptor.forClass(ScheduledSession.class);
    verify(scheduledSessionRepository).save(captor.capture());
    ScheduledSession saved = captor.getValue();
    assertEquals(newTrainerId, saved.getTrainerId());
    assertTrue(saved.isInstanceOverride());
}

@Test
void cancelOrRestoreSession_cancelsSession() {
    // Arrange
    String sessionId = "yoga__2025-09-26__09:00";
    
    ScheduledSession existing = new ScheduledSession();
    existing.setId(UUID.randomUUID());
    existing.setSessionId(sessionId);
    existing.setCanceled(false);
    existing.setInstanceOverride(false);

    when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)).thenReturn(Optional.of(existing));
    when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(inv -> inv.getArgument(0));

    // Act
    scheduleService.cancelOrRestoreSession(sessionId, true);

    // Assert
    ArgumentCaptor<ScheduledSession> captor = ArgumentCaptor.forClass(ScheduledSession.class);
    verify(scheduledSessionRepository).save(captor.capture());
    ScheduledSession saved = captor.getValue();
    assertTrue(saved.isCanceled());
    assertTrue(saved.isInstanceOverride());
}

@Test
void cancelOrRestoreSession_restoresSession() {
    // Arrange
    String sessionId = "yoga__2025-09-26__09:00";
    
    ScheduledSession existing = new ScheduledSession();
    existing.setId(UUID.randomUUID());
    existing.setSessionId(sessionId);
    existing.setCanceled(true);
    existing.setInstanceOverride(true);

    when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)).thenReturn(Optional.of(existing));
    when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(inv -> inv.getArgument(0));

    // Act
    scheduleService.cancelOrRestoreSession(sessionId, false);

    // Assert
    ArgumentCaptor<ScheduledSession> captor = ArgumentCaptor.forClass(ScheduledSession.class);
    verify(scheduledSessionRepository).save(captor.capture());
    ScheduledSession saved = captor.getValue();
    assertFalse(saved.isCanceled());
    assertTrue(saved.isInstanceOverride());
}

@Test
void addParticipant_createsIncludedOverride() {
    // Arrange
    String sessionId = "yoga__2025-09-26__09:00";
    UUID studentId = UUID.randomUUID();
    UUID sessionDbId = UUID.randomUUID();
    
    ScheduledSession existing = new ScheduledSession();
    existing.setId(sessionDbId);
    existing.setSessionId(sessionId);

    when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)).thenReturn(Optional.of(existing));
    when(sessionParticipantRepository.findByScheduledSession_IdAndStudentIdAndIsActiveTrue(sessionDbId, studentId))
            .thenReturn(List.of());
    when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(inv -> inv.getArgument(0));

    // Act
    scheduleService.addParticipant(sessionId, studentId);

    // Assert
    ArgumentCaptor<SessionParticipant> captor = ArgumentCaptor.forClass(SessionParticipant.class);
    verify(sessionParticipantRepository).save(captor.capture());
    SessionParticipant saved = captor.getValue();
    assertEquals(studentId, saved.getStudentId());
    assertTrue(saved.isIncluded());
}

@Test
void addParticipant_removesExcludedOverride() {
    // Arrange
    String sessionId = "yoga__2025-09-26__09:00";
    UUID studentId = UUID.randomUUID();
    UUID sessionDbId = UUID.randomUUID();
    
    ScheduledSession existing = new ScheduledSession();
    existing.setId(sessionDbId);
    existing.setSessionId(sessionId);

    SessionParticipant excludedParticipant = new SessionParticipant();
    excludedParticipant.setStudentId(studentId);
    excludedParticipant.setParticipationType(SessionParticipant.ParticipationType.EXCLUDED);

    when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)).thenReturn(Optional.of(existing));
    when(sessionParticipantRepository.findByScheduledSession_IdAndStudentIdAndIsActiveTrue(sessionDbId, studentId))
            .thenReturn(List.of(excludedParticipant));
    when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(inv -> inv.getArgument(0));

    // Act
    scheduleService.addParticipant(sessionId, studentId);

    // Assert
    verify(sessionParticipantRepository).delete(excludedParticipant);
    ArgumentCaptor<SessionParticipant> captor = ArgumentCaptor.forClass(SessionParticipant.class);
    verify(sessionParticipantRepository).save(captor.capture());
    SessionParticipant saved = captor.getValue();
    assertTrue(saved.isIncluded());
}

@Test
void removeParticipant_createsExcludedOverride() {
    // Arrange
    String sessionId = "yoga__2025-09-26__09:00";
    UUID studentId = UUID.randomUUID();
    UUID sessionDbId = UUID.randomUUID();
    
    ScheduledSession existing = new ScheduledSession();
    existing.setId(sessionDbId);
    existing.setSessionId(sessionId);

    when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)).thenReturn(Optional.of(existing));
    when(sessionParticipantRepository.findByScheduledSession_IdAndStudentIdAndIsActiveTrue(sessionDbId, studentId))
            .thenReturn(List.of());
    when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(inv -> inv.getArgument(0));

    // Act
    scheduleService.removeParticipant(sessionId, studentId);

    // Assert
    ArgumentCaptor<SessionParticipant> captor = ArgumentCaptor.forClass(SessionParticipant.class);
    verify(sessionParticipantRepository).save(captor.capture());
    SessionParticipant saved = captor.getValue();
    assertEquals(studentId, saved.getStudentId());
    assertTrue(saved.isExcluded());
}

@Test
void removeParticipant_removesIncludedOverride() {
    // Arrange
    String sessionId = "yoga__2025-09-26__09:00";
    UUID studentId = UUID.randomUUID();
    UUID sessionDbId = UUID.randomUUID();
    
    ScheduledSession existing = new ScheduledSession();
    existing.setId(sessionDbId);
    existing.setSessionId(sessionId);

    SessionParticipant includedParticipant = new SessionParticipant();
    includedParticipant.setStudentId(studentId);
    includedParticipant.setParticipationType(SessionParticipant.ParticipationType.INCLUDED);

    when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)).thenReturn(Optional.of(existing));
    when(sessionParticipantRepository.findByScheduledSession_IdAndStudentIdAndIsActiveTrue(sessionDbId, studentId))
            .thenReturn(List.of(includedParticipant));
    when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(inv -> inv.getArgument(0));

    // Act
    scheduleService.removeParticipant(sessionId, studentId);

    // Assert
    verify(sessionParticipantRepository).delete(includedParticipant);
    ArgumentCaptor<SessionParticipant> captor = ArgumentCaptor.forClass(SessionParticipant.class);
    verify(sessionParticipantRepository).save(captor.capture());
    SessionParticipant saved = captor.getValue();
    assertTrue(saved.isExcluded());
}

@Test
void updateParticipantPresence_updatesPresenceAndNotes() {
    // Arrange
    String sessionId = "yoga__2025-09-26__09:00";
    UUID studentId = UUID.randomUUID();
    UUID sessionDbId = UUID.randomUUID();
    
    ScheduledSession existing = new ScheduledSession();
    existing.setId(sessionDbId);
    existing.setSessionId(sessionId);

    SessionParticipant participant = new SessionParticipant();
    participant.setStudentId(studentId);
    participant.setParticipationType(SessionParticipant.ParticipationType.INCLUDED);
    participant.setPresent(false);

    when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)).thenReturn(Optional.of(existing));
    when(sessionParticipantRepository.findByScheduledSession_IdAndStudentIdAndIsActiveTrue(sessionDbId, studentId))
            .thenReturn(List.of(participant));
    when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(inv -> inv.getArgument(0));

    // Act
    scheduleService.updateParticipantPresence(sessionId, studentId, true, "Arrived late");

    // Assert
    ArgumentCaptor<SessionParticipant> captor = ArgumentCaptor.forClass(SessionParticipant.class);
    verify(sessionParticipantRepository).save(captor.capture());
    SessionParticipant saved = captor.getValue();
    assertTrue(saved.isPresent());
    assertEquals("Arrived late", saved.getAttendanceNotes());
}

@Test
void updateParticipantPresence_addsParticipantIfNotExists() {
    // Arrange
    String sessionId = "yoga__2025-09-26__09:00";
    UUID studentId = UUID.randomUUID();
    UUID sessionDbId = UUID.randomUUID();
    
    ScheduledSession existing = new ScheduledSession();
    existing.setId(sessionDbId);
    existing.setSessionId(sessionId);

    when(scheduledSessionRepository.findBySessionIdAndIsActiveTrue(sessionId)).thenReturn(Optional.of(existing));
    when(sessionParticipantRepository.findByScheduledSession_IdAndStudentIdAndIsActiveTrue(sessionDbId, studentId))
            .thenReturn(List.of())
            .thenReturn(List.of(new SessionParticipant())); // after adding
    when(scheduledSessionRepository.save(any(ScheduledSession.class))).thenAnswer(inv -> inv.getArgument(0));

    // Act
    scheduleService.updateParticipantPresence(sessionId, studentId, true, "Present");

    // Assert
    verify(sessionParticipantRepository, atLeast(1)).save(any(SessionParticipant.class));
}
}

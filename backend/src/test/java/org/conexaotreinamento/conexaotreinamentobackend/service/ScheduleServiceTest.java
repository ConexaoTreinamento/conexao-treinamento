package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.SessionResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.*;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.repository.*;
import org.junit.jupiter.api.BeforeEach;
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

    private TrainerSchedule buildSchedule(UUID id, UUID trainerId, String seriesName, LocalTime start, LocalTime end) {
        TrainerSchedule s = new TrainerSchedule();
        s.setId(id != null ? id : UUID.randomUUID());
        s.setTrainerId(trainerId);
        s.setSeriesName(seriesName);
        s.setStartTime(start);
        s.setEndTime(end);
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
        LocalTime end = LocalTime.of(10, 0);
        TrainerSchedule schedule = buildSchedule(UUID.randomUUID(), trainerId, "Yoga Basics", start, end);

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
        assertEquals(trainerId, dto.getTrainerId());
        assertEquals(LocalDateTime.of(date, start), dto.getStartTime());
        assertEquals(LocalDateTime.of(date, end), dto.getEndTime());
        assertEquals("Yoga Basics", dto.getSeriesName());
        assertEquals("John Trainer", dto.getTrainerName());
        assertFalse(dto.isInstanceOverride());
        assertNotNull(dto.getSessionId());
        // Expected slug format: "yoga-basics__YYYY-MM-DD__HH:MM"
        assertTrue(dto.getSessionId().startsWith("yoga-basics__" + date + "__09:00"));
        assertNotNull(dto.getStudents());
        assertTrue(dto.getStudents().isEmpty());
    }

    @Test
    void getScheduledSessions_usesExistingInstanceData_whenInstancePresent() {
        // Arrange
        LocalDate date = LocalDate.of(2025, 9, 26);
        LocalTime start = LocalTime.of(9, 0);
        LocalTime end = LocalTime.of(10, 0);
        TrainerSchedule schedule = buildSchedule(UUID.randomUUID(), trainerId, "Yoga Basics", start, end);

        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(anyInt(), any(Instant.class)))
                .thenReturn(List.of(schedule));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(studentCommitmentRepository.findBySessionSeriesId(schedule.getId())).thenReturn(List.of());

        // Build an existing instance that matches the generated sessionId
        String expectedSessionId = "yoga-basics__" + date + "__09:00";
        ScheduledSession existing = buildExistingSession(UUID.randomUUID(), expectedSessionId, schedule.getId(), trainerId, date, start, end, "Bring water bottle", true);

        when(scheduledSessionRepository.findByStartTimeBetweenAndActiveTrue(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(existing));

        // Act
        List<SessionResponseDTO> sessions = scheduleService.getScheduledSessions(date, date);

        // Assert
        assertEquals(1, sessions.size());
        SessionResponseDTO dto = sessions.get(0);
        assertEquals(expectedSessionId, dto.getSessionId());
        assertEquals("Bring water bottle", dto.getNotes());
        assertTrue(dto.isInstanceOverride());
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
        TrainerSchedule s1 = buildSchedule(UUID.randomUUID(), trainerId, "Morning Flow", LocalTime.of(8, 0), LocalTime.of(9, 0));
        TrainerSchedule s2 = buildSchedule(UUID.randomUUID(), trainerId, "Power Yoga", LocalTime.of(7, 0), LocalTime.of(8, 0));

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
        assertTrue(sessions.get(0).getStartTime().isBefore(sessions.get(1).getStartTime()));
    }
}

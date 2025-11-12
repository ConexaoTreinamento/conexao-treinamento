package org.conexaotreinamento.conexaotreinamentobackend.unit.service;

import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerScheduleRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.TrainerScheduleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrainerScheduleServiceTest {

    @Mock
    private TrainerScheduleRepository trainerScheduleRepository;

    @InjectMocks
    private TrainerScheduleService trainerScheduleService;

    private UUID trainerId;
    private UUID scheduleId;

    @BeforeEach
    void setUp() {
        trainerId = UUID.randomUUID();
        scheduleId = UUID.randomUUID();
    }

    private TrainerSchedule newSchedule(UUID id, UUID trainerId, int weekday, String seriesName, String start, int interval) {
        TrainerSchedule ts = new TrainerSchedule();
        ts.setId(id);
        ts.setTrainerId(trainerId);
        ts.setWeekday(weekday);
        ts.setSeriesName(seriesName);
        ts.setStartTime(LocalTime.parse(start));
        ts.setIntervalDuration(interval);
        ts.setEffectiveFromTimestamp(Instant.now().minusSeconds(3600));
        ts.setActive(true);
        return ts;
    }

    @Test
    void getAllActiveSchedules_returnsRepositoryResult() {
        // Arrange
        TrainerSchedule a = newSchedule(UUID.randomUUID(), trainerId, 1, "Yoga", "09:00", 60);
        TrainerSchedule b = newSchedule(UUID.randomUUID(), trainerId, 2, "Pilates", "11:00", 60);
        when(trainerScheduleRepository.findByIsActiveTrue()).thenReturn(List.of(a, b));

        // Act
        List<TrainerSchedule> result = trainerScheduleService.getAllActiveSchedules();

        // Assert
        assertEquals(2, result.size());
        verify(trainerScheduleRepository).findByIsActiveTrue();
    }

    @Test
    void getSchedulesByTrainer_returnsRepositoryResult() {
        // Arrange
        TrainerSchedule a = newSchedule(UUID.randomUUID(), trainerId, 1, "Yoga", "09:00", 60);
        when(trainerScheduleRepository.findByTrainerIdAndIsActiveTrue(trainerId)).thenReturn(List.of(a));

        // Act
        List<TrainerSchedule> result = trainerScheduleService.getSchedulesByTrainer(trainerId);

        // Assert
        assertEquals(1, result.size());
        assertEquals(trainerId, result.get(0).getTrainerId());
        verify(trainerScheduleRepository).findByTrainerIdAndIsActiveTrue(trainerId);
    }

    @Test
    void getScheduleById_returnsOptional() {
        // Arrange
        TrainerSchedule a = newSchedule(scheduleId, trainerId, 1, "Yoga", "09:00", 60);
        when(trainerScheduleRepository.findById(scheduleId)).thenReturn(Optional.of(a));

        // Act
        Optional<TrainerSchedule> result = trainerScheduleService.getScheduleById(scheduleId);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(scheduleId, result.get().getId());
        verify(trainerScheduleRepository).findById(scheduleId);
    }

    @Test
    void getScheduleById_returnsEmpty_whenNotFound() {
        // Arrange
        when(trainerScheduleRepository.findById(scheduleId)).thenReturn(Optional.empty());

        // Act
        Optional<TrainerSchedule> result = trainerScheduleService.getScheduleById(scheduleId);

        // Assert
        assertTrue(result.isEmpty());
        verify(trainerScheduleRepository).findById(scheduleId);
    }

    @Test
    void createSchedule_setsEffectiveFromTimestamp_andSaves() {
        // Arrange
        TrainerSchedule input = new TrainerSchedule();
        input.setTrainerId(trainerId);
        input.setWeekday(5);
        input.setSeriesName("Strength");
        input.setStartTime(LocalTime.of(15, 0));
        input.setIntervalDuration(60);

        when(trainerScheduleRepository.save(any(TrainerSchedule.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        TrainerSchedule saved = trainerScheduleService.createSchedule(input);

        // Assert
        assertNotNull(saved.getEffectiveFromTimestamp(), "effectiveFromTimestamp should be set");
        verify(trainerScheduleRepository).save(saved);
    }

    @Test
    void createSchedule_ignoresExistingSoftDeletedState_andBuildsFreshEntity() {
        // Arrange: payload that looks like a previously deleted schedule
        TrainerSchedule payload = new TrainerSchedule();
        payload.setId(scheduleId);
        payload.setTrainerId(trainerId);
        payload.setWeekday(2);
        payload.setSeriesName("Spin Class");
        payload.setStartTime(LocalTime.of(7, 0));
        payload.setIntervalDuration(60);
        payload.setActive(false);
        payload.setDeletedAt(Instant.now().minusSeconds(600));

        ArgumentCaptor<TrainerSchedule> captor = ArgumentCaptor.forClass(TrainerSchedule.class);
        when(trainerScheduleRepository.save(any(TrainerSchedule.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        TrainerSchedule result = trainerScheduleService.createSchedule(payload);

        // Assert: repository receives a fresh entity, not the payload reference
        verify(trainerScheduleRepository).save(captor.capture());
        TrainerSchedule persisted = captor.getValue();

        assertNotSame(payload, persisted, "createSchedule should build a fresh entity instance");
        assertNull(persisted.getId(), "New schedule should not reuse the previous identifier");
        assertTrue(persisted.isActive(), "New schedule must start active");
        assertNull(persisted.getDeletedAt(), "New schedule should not inherit deletedAt timestamp");
        assertEquals(payload.getTrainerId(), persisted.getTrainerId());
        assertEquals(payload.getWeekday(), persisted.getWeekday());
        assertEquals(payload.getStartTime(), persisted.getStartTime());
        assertEquals(payload.getIntervalDuration(), persisted.getIntervalDuration());
        assertEquals(payload.getSeriesName(), persisted.getSeriesName());
        assertNotNull(result.getEffectiveFromTimestamp(), "Fresh schedule should receive an effective timestamp");
    }

    @Test
    void updateSchedule_updatesFields_andSaves_whenFound() {
        // Arrange: existing schedule
        TrainerSchedule existing = newSchedule(scheduleId, trainerId, 1, "Yoga", "09:00", 60);
        when(trainerScheduleRepository.findById(scheduleId)).thenReturn(Optional.of(existing));
        when(trainerScheduleRepository.save(any(TrainerSchedule.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Updated payload
        TrainerSchedule updated = new TrainerSchedule();
        updated.setWeekday(2);
        updated.setStartTime(LocalTime.of(11, 0));
        updated.setIntervalDuration(45);
        updated.setSeriesName("Pilates");

        // Act
        TrainerSchedule result = trainerScheduleService.updateSchedule(scheduleId, updated);

        // Assert
        assertEquals(2, result.getWeekday());
        assertEquals(LocalTime.of(11, 0), result.getStartTime());
        assertEquals(LocalTime.of(11, 45), result.calculateEndTime());
        assertEquals(45, result.getIntervalDuration());
        assertEquals("Pilates", result.getSeriesName());
        verify(trainerScheduleRepository).save(existing);

        // updatedAt should be touched via updateTimestamp (cannot guarantee Instant equality, but non-null)
        assertNotNull(result.getUpdatedAt(), "updatedAt should be set by updateTimestamp");
    }

    @Test
    void updateSchedule_throws_whenNotFound() {
        // Arrange
        when(trainerScheduleRepository.findById(scheduleId)).thenReturn(Optional.empty());

        // Act + Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> trainerScheduleService.updateSchedule(scheduleId, new TrainerSchedule()));
        assertTrue(ex.getMessage().contains("TrainerSchedule not found"), "Message: " + ex.getMessage());
        verify(trainerScheduleRepository, never()).save(any());
    }

    @Test
    void deleteSchedule_softDeletes_andSaves_whenFound() {
        // Arrange
        TrainerSchedule existing = newSchedule(scheduleId, trainerId, 4, "Cardio", "13:00", 60);
        when(trainerScheduleRepository.findById(scheduleId)).thenReturn(Optional.of(existing));

        // Act
        trainerScheduleService.deleteSchedule(scheduleId);

        // Assert: capture saved entity
        ArgumentCaptor<TrainerSchedule> captor = ArgumentCaptor.forClass(TrainerSchedule.class);
        verify(trainerScheduleRepository).save(captor.capture());
        TrainerSchedule saved = captor.getValue();
        assertFalse(saved.isActive(), "softDelete should set active=false");
        assertNotNull(saved.getDeletedAt(), "softDelete should set deletedAt");
    }

    @Test
    void deleteSchedule_doesNothing_whenNotFound() {
        // Arrange
        when(trainerScheduleRepository.findById(scheduleId)).thenReturn(Optional.empty());

        // Act
        trainerScheduleService.deleteSchedule(scheduleId);

        // Assert
        verify(trainerScheduleRepository, never()).save(any());
    }

    @Test
    void getScheduleAtTime_returnsLatestActiveSchedule_whenAvailable() {
        // Arrange
        Instant now = Instant.now();
        TrainerSchedule older = newSchedule(UUID.randomUUID(), trainerId, 3, "Old", "07:00", 60);
        older.setEffectiveFromTimestamp(now.minusSeconds(7200));
        TrainerSchedule newer = newSchedule(UUID.randomUUID(), trainerId, 3, "New", "07:30", 60);
        newer.setEffectiveFromTimestamp(now.minusSeconds(3600));

        when(trainerScheduleRepository.findByTrainerIdAndWeekdayAndEffectiveFromTimestampLessThanEqualOrderByEffectiveFromTimestampDesc(
                eq(trainerId), eq(3), any(Instant.class)))
                .thenReturn(List.of(newer, older));

        // Act
        Optional<TrainerSchedule> result = trainerScheduleService.getScheduleAtTime(trainerId, 3, now);

        // Assert
        assertTrue(result.isPresent());
        assertEquals("New", result.get().getSeriesName());
    }

    @Test
    void getScheduleAtTime_returnsEmpty_whenNone() {
        // Arrange
        when(trainerScheduleRepository.findByTrainerIdAndWeekdayAndEffectiveFromTimestampLessThanEqualOrderByEffectiveFromTimestampDesc(
                eq(trainerId), eq(3), any(Instant.class)))
                .thenReturn(List.of());

        // Act
        Optional<TrainerSchedule> result = trainerScheduleService.getScheduleAtTime(trainerId, 3, Instant.now());

        // Assert
        assertTrue(result.isEmpty());
    }

    @Test
    void getSchedulesForWeekdayAtTime_returnsRepositoryResult() {
        // Arrange
        Instant t = Instant.now();
        TrainerSchedule a = newSchedule(UUID.randomUUID(), trainerId, 5, "A", "09:00", 60);
        when(trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(5, t)).thenReturn(List.of(a));

        // Act
        List<TrainerSchedule> result = trainerScheduleService.getSchedulesForWeekdayAtTime(5, t);

        // Assert
        assertEquals(1, result.size());
        verify(trainerScheduleRepository).findByWeekdayAndEffectiveFromTimestampLessThanEqual(5, t);
    }
}

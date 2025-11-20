package org.conexaotreinamento.conexaotreinamentobackend.unit.service;

import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentCommitment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlan;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlanAssignment;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentCommitmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentCommitmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentCommitmentServiceTest {

    @Mock
    private StudentCommitmentRepository studentCommitmentRepository;

    @Mock
    private org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanRepository studentPlanRepository;

    @Mock
    private org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanAssignmentRepository studentPlanAssignmentRepository;

    @Mock
    private org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerScheduleRepository trainerScheduleRepository;

    @InjectMocks
    private StudentCommitmentService studentCommitmentService;

    private UUID studentId;
    private UUID seriesId;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        seriesId = UUID.randomUUID();
    }

    private StudentCommitment commitment(UUID id, UUID studentId, UUID seriesId, CommitmentStatus status, Instant effectiveFrom) {
        StudentCommitment c = new StudentCommitment();
        c.setId(id != null ? id : UUID.randomUUID());
        c.setStudentId(studentId);
        c.setSessionSeriesId(seriesId);
        c.setCommitmentStatus(status);
        c.setEffectiveFromTimestamp(effectiveFrom);
        return c;
    }

    @Test
    void getCurrentCommitmentStatus_returnsDefault_whenNone() {
        // Arrange
        Instant t = Instant.now();
        when(studentCommitmentRepository
                .findByStudentIdAndSessionSeriesIdAndEffectiveFromTimestampLessThanEqualOrderByEffectiveFromTimestampDesc(
                        studentId, seriesId, t))
                .thenReturn(List.of());

        // Act
        CommitmentStatus result = studentCommitmentService.getCurrentCommitmentStatus(studentId, seriesId, t);

        // Assert
        assertEquals(CommitmentStatus.NOT_ATTENDING, result);
    }

    @Test
    void getCurrentCommitmentStatus_returnsMostRecent_whenAvailable() {
        // Arrange
        Instant t = Instant.parse("2025-09-20T10:00:00Z");
        StudentCommitment older = commitment(null, studentId, seriesId, CommitmentStatus.ATTENDING, Instant.parse("2025-09-10T00:00:00Z"));
        StudentCommitment newer = commitment(null, studentId, seriesId, CommitmentStatus.TENTATIVE, Instant.parse("2025-09-15T00:00:00Z"));
        when(studentCommitmentRepository
                .findByStudentIdAndSessionSeriesIdAndEffectiveFromTimestampLessThanEqualOrderByEffectiveFromTimestampDesc(
                        studentId, seriesId, t))
                .thenReturn(List.of(newer, older));

        // Act
        CommitmentStatus result = studentCommitmentService.getCurrentCommitmentStatus(studentId, seriesId, t);

        // Assert
        assertEquals(CommitmentStatus.TENTATIVE, result);
    }

    @Test
    void updateCommitment_setsNow_whenNoCustomTimestamp() {
        // Arrange
        when(studentCommitmentRepository.save(any(StudentCommitment.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        StudentCommitment saved = studentCommitmentService.updateCommitment(studentId, seriesId, CommitmentStatus.NOT_ATTENDING);

        // Assert
        assertEquals(studentId, saved.getStudentId());
        assertEquals(seriesId, saved.getSessionSeriesId());
        assertEquals(CommitmentStatus.NOT_ATTENDING, saved.getCommitmentStatus());
        assertNotNull(saved.getEffectiveFromTimestamp());
    }

    @Test
    void updateCommitment_usesCustomTimestamp_whenProvided() {
        // Arrange
        Instant custom = Instant.parse("2025-09-01T00:00:00Z");
        when(studentCommitmentRepository.save(any(StudentCommitment.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        StudentCommitment saved = studentCommitmentService.updateCommitment(studentId, seriesId, CommitmentStatus.NOT_ATTENDING, custom);

        // Assert
        assertEquals(custom, saved.getEffectiveFromTimestamp());
    }

    @Test
    void getStudentCommitments_returnsRepositoryResult() {
        // Arrange
        StudentCommitment c1 = commitment(null, studentId, seriesId, CommitmentStatus.ATTENDING, Instant.now());
        when(studentCommitmentRepository.findByStudentId(studentId)).thenReturn(List.of(c1));

        // Act
        List<StudentCommitment> list = studentCommitmentService.getStudentCommitments(studentId);

        // Assert
        assertEquals(1, list.size());
        verify(studentCommitmentRepository).findByStudentId(studentId);
    }

    @Test
    void getSessionSeriesCommitments_returnsRepositoryResult() {
        // Arrange
        StudentCommitment c1 = commitment(null, studentId, seriesId, CommitmentStatus.NOT_ATTENDING, Instant.now());
        when(studentCommitmentRepository.findBySessionSeriesId(seriesId)).thenReturn(List.of(c1));

        // Act
        List<StudentCommitment> list = studentCommitmentService.getSessionSeriesCommitments(seriesId);

        // Assert
        assertEquals(1, list.size());
        verify(studentCommitmentRepository).findBySessionSeriesId(seriesId);
    }

    @Test
    void getCurrentActiveCommitments_filtersByAttendingAndTimestamp() {
        // Arrange
        Instant t = Instant.now();
        UUID otherSeries = UUID.randomUUID();
        UUID futureSeries = UUID.randomUUID();
        StudentCommitment pastAttending = commitment(null, studentId, seriesId, CommitmentStatus.ATTENDING, t.minusSeconds(20));
        StudentCommitment latestNotAttending = commitment(null, studentId, seriesId, CommitmentStatus.NOT_ATTENDING, t.minusSeconds(5));
        StudentCommitment keepAttending = commitment(null, studentId, otherSeries, CommitmentStatus.ATTENDING, t.minusSeconds(10));
        StudentCommitment futureCommitment = commitment(null, studentId, futureSeries, CommitmentStatus.ATTENDING, t.plusSeconds(60));
        when(studentCommitmentRepository.findByStudentId(studentId))
            .thenReturn(List.of(pastAttending, latestNotAttending, keepAttending, futureCommitment));

        // Act
        List<StudentCommitment> list = studentCommitmentService.getCurrentActiveCommitments(studentId, t);

        // Assert: only the ATTENDING commitment for otherSeries should remain
    assertEquals(1, list.size());
    assertEquals(otherSeries, list.get(0).getSessionSeriesId());
        verify(studentCommitmentRepository).findByStudentId(studentId);
    }

    @Test
    void getCommitmentHistory_returnsOrderedDescByRepository() {
        // Arrange
        StudentCommitment c1 = commitment(null, studentId, seriesId, CommitmentStatus.ATTENDING, Instant.now().minusSeconds(10));
        when(studentCommitmentRepository
                .findByStudentIdAndSessionSeriesIdAndEffectiveFromTimestampLessThanEqualOrderByEffectiveFromTimestampDesc(
                        eq(studentId), eq(seriesId), any(Instant.class)))
                .thenReturn(List.of(c1));

        // Act
        List<StudentCommitment> list = studentCommitmentService.getCommitmentHistory(studentId, seriesId);

        // Assert
        assertEquals(1, list.size());
        verify(studentCommitmentRepository, times(1))
                .findByStudentIdAndSessionSeriesIdAndEffectiveFromTimestampLessThanEqualOrderByEffectiveFromTimestampDesc(
                        eq(studentId), eq(seriesId), any(Instant.class));
    }

    private StudentPlanAssignment buildAssignmentWithPlan(UUID planId, int maxDays) {
        return buildAssignmentWithPlan(planId, maxDays, true);
    }

    private StudentPlanAssignment buildAssignmentWithPlan(UUID planId, int maxDays, boolean active) {
        StudentPlan plan = new StudentPlan();
        plan.setId(planId);
        plan.setActive(active);
        plan.setMaxDays(maxDays);
        plan.setName("Test Plan");
        plan.setDurationDays(30);
        StudentPlanAssignment assign = new StudentPlanAssignment();
        assign.setPlanId(planId);
        assign.setPlan(plan); // convenience for test
        assign.setDurationDays(plan.getDurationDays());
        return assign;
    }

    @Test
    void bulkUpdateCommitments_attending_withinPlanLimit_savesEach() {
        // Arrange
    List<UUID> seriesIds = List.of(UUID.randomUUID(), UUID.randomUUID());
    UUID planId = UUID.randomUUID();
    when(studentPlanAssignmentRepository.findCurrentActiveAssignment(studentId))
        .thenReturn(Optional.of(buildAssignmentWithPlan(planId, 5)));
    StudentPlan plan = new StudentPlan();
    plan.setId(planId);
    plan.setActive(true);
    plan.setMaxDays(5);
    plan.setName("Test Plan");
    plan.setDurationDays(30);
    when(studentPlanRepository.findById(planId)).thenReturn(Optional.of(plan));
    when(studentCommitmentRepository.findByStudentId(studentId)).thenReturn(List.of());
    // Return same weekday to avoid exceeding limit
    when(trainerScheduleRepository.findById(any(UUID.class))).thenAnswer(inv -> {
        UUID id = inv.getArgument(0);
        org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule ts = new org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule();
        ts.setId(id);
        ts.setWeekday(1);
        return Optional.of(ts);
    });
    when(studentCommitmentRepository.save(any(StudentCommitment.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        List<StudentCommitment> saved = studentCommitmentService.bulkUpdateCommitments(studentId, seriesIds, CommitmentStatus.ATTENDING);

        // Assert
        assertEquals(2, saved.size());
        ArgumentCaptor<StudentCommitment> captor = ArgumentCaptor.forClass(StudentCommitment.class);
        verify(studentCommitmentRepository, times(2)).save(captor.capture());
        List<StudentCommitment> allSaved = captor.getAllValues();
        assertEquals(seriesIds.get(0), allSaved.get(0).getSessionSeriesId());
        assertEquals(seriesIds.get(1), allSaved.get(1).getSessionSeriesId());
    }

    @Test
    void bulkUpdateCommitments_attending_noActivePlan_throws() {
        // Arrange
    List<UUID> seriesIds = List.of(UUID.randomUUID());
    when(studentPlanAssignmentRepository.findCurrentActiveAssignment(studentId)).thenReturn(Optional.empty());

        // Act + Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                studentCommitmentService.bulkUpdateCommitments(studentId, seriesIds, CommitmentStatus.ATTENDING));
        assertTrue(ex.getMessage().toLowerCase().contains("no active plan"));
        verify(studentCommitmentRepository, never()).save(any());
    }

    @Test
    void bulkUpdateCommitments_attending_exceedsPlanLimit_throws() {
        // Arrange
    List<UUID> seriesIds = List.of(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());
    UUID planId = UUID.randomUUID();
    when(studentPlanAssignmentRepository.findCurrentActiveAssignment(studentId))
        .thenReturn(Optional.of(buildAssignmentWithPlan(planId, 3)));
    StudentPlan plan3 = new StudentPlan();
    plan3.setId(planId);
    plan3.setActive(true);
    plan3.setMaxDays(3);
    plan3.setName("Plan3");
    plan3.setDurationDays(30);
    when(studentPlanRepository.findById(planId)).thenReturn(Optional.of(plan3));
    // already has 1 active on weekday 1
    UUID existingSeries = UUID.randomUUID();
    when(studentCommitmentRepository.findByStudentId(studentId))
        .thenReturn(List.of(commitment(null, studentId, existingSeries, CommitmentStatus.ATTENDING, Instant.now().minusSeconds(100))));
    // Default to weekday 1
    when(trainerScheduleRepository.findById(any(UUID.class))).thenAnswer(inv -> {
        UUID id = inv.getArgument(0);
        org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule ts = new org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule();
        ts.setId(id);
        ts.setWeekday(1);
        return Optional.of(ts);
    });
    // But for the three new series, return distinct weekdays 2,3,4
    org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule ts1 = new org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule();
    ts1.setId(seriesIds.get(0)); ts1.setWeekday(2);
    org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule ts2 = new org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule();
    ts2.setId(seriesIds.get(1)); ts2.setWeekday(3);
    org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule ts3 = new org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule();
    ts3.setId(seriesIds.get(2)); ts3.setWeekday(4);
    when(trainerScheduleRepository.findById(seriesIds.get(0))).thenReturn(Optional.of(ts1));
    when(trainerScheduleRepository.findById(seriesIds.get(1))).thenReturn(Optional.of(ts2));
    when(trainerScheduleRepository.findById(seriesIds.get(2))).thenReturn(Optional.of(ts3));

        // Act + Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                studentCommitmentService.bulkUpdateCommitments(studentId, seriesIds, CommitmentStatus.ATTENDING));
        assertTrue(ex.getMessage().toLowerCase().contains("exced"), "Unexpected message: " + ex.getMessage());
        verify(studentCommitmentRepository, never()).save(any());
    }

    @Test
    void bulkUpdateCommitments_notAttending_bypassesPlanValidation() {
        // Arrange
    List<UUID> seriesIds = List.of(UUID.randomUUID(), UUID.randomUUID());
    when(studentCommitmentRepository.save(any(StudentCommitment.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        List<StudentCommitment> saved = studentCommitmentService.bulkUpdateCommitments(studentId, seriesIds, CommitmentStatus.NOT_ATTENDING);

        // Assert
        assertEquals(2, saved.size());
        // Plan services not touched when NOT_ATTENDING
        verify(studentPlanAssignmentRepository, never()).findCurrentActiveAssignment(any());
    }

    @Test
    void updateCommitment_attending_singleUpdate_validatesPlanAndSaves() {
    // Arrange: validation is now active for ATTENDING in single update
    UUID planId = UUID.randomUUID();
    when(studentPlanAssignmentRepository.findCurrentActiveAssignment(studentId))
        .thenReturn(Optional.of(buildAssignmentWithPlan(planId, 5)));
    StudentPlan plan5 = new StudentPlan();
    plan5.setId(planId);
    plan5.setActive(true);
    plan5.setMaxDays(5);
    plan5.setName("Plan5");
    plan5.setDurationDays(30);
    when(studentPlanRepository.findById(planId)).thenReturn(Optional.of(plan5));
    when(studentCommitmentRepository.findByStudentId(studentId)).thenReturn(List.of());
    when(trainerScheduleRepository.findById(any(UUID.class))).thenAnswer(inv -> {
        UUID id = inv.getArgument(0);
        org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule ts = new org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule();
        ts.setId(id);
        ts.setWeekday(1);
        return Optional.of(ts);
    });
    when(studentCommitmentRepository.save(any(StudentCommitment.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        StudentCommitment saved = studentCommitmentService.updateCommitment(studentId, seriesId, CommitmentStatus.ATTENDING);

        // Assert: saved successfully under plan validation
        assertEquals(CommitmentStatus.ATTENDING, saved.getCommitmentStatus());
    }

    @Test
    void updateCommitment_attending_allowsSoftDeletedPlan() {
        UUID planId = UUID.randomUUID();
        when(studentPlanAssignmentRepository.findCurrentActiveAssignment(studentId))
            .thenReturn(Optional.of(buildAssignmentWithPlan(planId, 4, false)));

        StudentPlan inactivePlan = new StudentPlan();
        inactivePlan.setId(planId);
        inactivePlan.setActive(false);
        inactivePlan.setMaxDays(4);
        inactivePlan.setName("Inactive Plan");
        inactivePlan.setDurationDays(30);
        when(studentPlanRepository.findById(planId)).thenReturn(Optional.of(inactivePlan));

        when(studentCommitmentRepository.findByStudentId(studentId)).thenReturn(List.of());
        when(trainerScheduleRepository.findById(any(UUID.class))).thenAnswer(inv -> {
            UUID id = inv.getArgument(0);
            org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule ts = new org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule();
            ts.setId(id);
            ts.setWeekday(1);
            return Optional.of(ts);
        });
        when(studentCommitmentRepository.save(any(StudentCommitment.class))).thenAnswer(inv -> inv.getArgument(0));

        StudentCommitment saved = studentCommitmentService.updateCommitment(studentId, seriesId, CommitmentStatus.ATTENDING);

        assertEquals(CommitmentStatus.ATTENDING, saved.getCommitmentStatus());
        verify(studentPlanRepository).findById(planId);
    }

    @Test
    void updateCommitment_attending_noActivePlan_throws() {
        // Arrange
        when(studentPlanAssignmentRepository.findCurrentActiveAssignment(studentId)).thenReturn(Optional.empty());

        // Act + Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                studentCommitmentService.updateCommitment(studentId, seriesId, CommitmentStatus.ATTENDING));
        assertTrue(ex.getMessage().contains("no active plan"));
    }

    @Test
    void updateCommitment_attending_alreadyAttending_succeeds() {
        // Arrange
        UUID planId = UUID.randomUUID();
        when(studentPlanAssignmentRepository.findCurrentActiveAssignment(studentId))
                .thenReturn(Optional.of(buildAssignmentWithPlan(planId, 2)));
        StudentPlan plan = new StudentPlan();
        plan.setId(planId);
        plan.setMaxDays(2);
        when(studentPlanRepository.findById(planId)).thenReturn(Optional.of(plan));

        // Mock existing commitment as ATTENDING for the same series
        StudentCommitment existing = commitment(null, studentId, seriesId, CommitmentStatus.ATTENDING, Instant.now());
        when(studentCommitmentRepository.findByStudentId(studentId)).thenReturn(List.of(existing));
        
        when(studentCommitmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Act
        studentCommitmentService.updateCommitment(studentId, seriesId, CommitmentStatus.ATTENDING);

        // Assert
        verify(studentCommitmentRepository).save(any());
    }

    @Test
    void updateCommitment_attending_newWeekday_exceedsLimit_throws() {
        // Arrange
        UUID planId = UUID.randomUUID();
        when(studentPlanAssignmentRepository.findCurrentActiveAssignment(studentId))
                .thenReturn(Optional.of(buildAssignmentWithPlan(planId, 1)));
        StudentPlan plan = new StudentPlan();
        plan.setId(planId);
        plan.setMaxDays(1);
        when(studentPlanRepository.findById(planId)).thenReturn(Optional.of(plan));

        // Existing commitment on weekday 1
        UUID otherSeries = UUID.randomUUID();
        StudentCommitment existing = commitment(null, studentId, otherSeries, CommitmentStatus.ATTENDING, Instant.now());
        when(studentCommitmentRepository.findByStudentId(studentId)).thenReturn(List.of(existing));

        org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule tsExisting = new org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule();
        tsExisting.setId(otherSeries);
        tsExisting.setWeekday(1);
        when(trainerScheduleRepository.findById(otherSeries)).thenReturn(Optional.of(tsExisting));

        // New commitment on weekday 2
        org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule tsNew = new org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule();
        tsNew.setId(seriesId);
        tsNew.setWeekday(2);
        when(trainerScheduleRepository.findById(seriesId)).thenReturn(Optional.of(tsNew));

        // Act + Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                studentCommitmentService.updateCommitment(studentId, seriesId, CommitmentStatus.ATTENDING));
        assertTrue(ex.getMessage().contains("excede o limite"));
    }

    @Test
    void resetScheduleIfExceedsPlan_doesNothing_whenWithinLimits() {
        // Arrange
        int maxDays = 2;
        // 1 active commitment
        StudentCommitment c1 = commitment(null, studentId, seriesId, CommitmentStatus.ATTENDING, Instant.now());
        when(studentCommitmentRepository.findByStudentId(studentId)).thenReturn(List.of(c1));
        
        org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule ts = new org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule();
        ts.setId(seriesId);
        ts.setWeekday(1);
        when(trainerScheduleRepository.findById(seriesId)).thenReturn(Optional.of(ts));

        // Act
        studentCommitmentService.resetScheduleIfExceedsPlan(studentId, maxDays);

        // Assert
        verify(studentCommitmentRepository, never()).save(any());
    }

    @Test
    void resetScheduleIfExceedsPlan_resets_whenExceedsLimits() {
        // Arrange
        int maxDays = 1;
        // 2 active commitments on different weekdays
        UUID s1 = UUID.randomUUID();
        UUID s2 = UUID.randomUUID();
        StudentCommitment c1 = commitment(null, studentId, s1, CommitmentStatus.ATTENDING, Instant.now());
        StudentCommitment c2 = commitment(null, studentId, s2, CommitmentStatus.ATTENDING, Instant.now());
        when(studentCommitmentRepository.findByStudentId(studentId)).thenReturn(List.of(c1, c2));
        
        org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule ts1 = new org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule();
        ts1.setId(s1);
        ts1.setWeekday(1);
        when(trainerScheduleRepository.findById(s1)).thenReturn(Optional.of(ts1));

        org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule ts2 = new org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule();
        ts2.setId(s2);
        ts2.setWeekday(2);
        when(trainerScheduleRepository.findById(s2)).thenReturn(Optional.of(ts2));

        // Act
        studentCommitmentService.resetScheduleIfExceedsPlan(studentId, maxDays);

        // Assert
        // Should call updateCommitment -> save for both
        verify(studentCommitmentRepository, times(2)).save(argThat(c -> c.getCommitmentStatus() == CommitmentStatus.NOT_ATTENDING));
    }
}

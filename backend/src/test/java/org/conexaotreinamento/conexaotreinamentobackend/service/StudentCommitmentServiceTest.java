package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentCommitment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlan;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlanAssignment;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentCommitmentRepository;
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
        StudentCommitment c1 = commitment(null, studentId, seriesId, CommitmentStatus.ATTENDING, t.minusSeconds(10));
        // Service now builds from all commitments and filters
        when(studentCommitmentRepository.findByStudentId(studentId)).thenReturn(List.of(c1));

        // Act
    List<StudentCommitment> list = studentCommitmentService.getCurrentActiveCommitments(studentId, t);

        // Assert
    assertEquals(1, list.size());
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
        StudentPlan plan = new StudentPlan();
        plan.setId(planId);
        plan.setActive(true);
        plan.setMaxDays(maxDays);
        plan.setName("Test Plan");
        plan.setDurationDays(30);
        StudentPlanAssignment assign = new StudentPlanAssignment();
        assign.setPlanId(planId);
        assign.setPlan(plan); // convenience for test
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
    when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.of(plan));
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
    when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.of(plan3));
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
    when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.of(plan5));
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
}

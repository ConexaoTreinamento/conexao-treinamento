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
    private StudentPlanService studentPlanService;

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
        StudentCommitment saved = studentCommitmentService.updateCommitment(studentId, seriesId, CommitmentStatus.ATTENDING);

        // Assert
        assertEquals(studentId, saved.getStudentId());
        assertEquals(seriesId, saved.getSessionSeriesId());
        assertEquals(CommitmentStatus.ATTENDING, saved.getCommitmentStatus());
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
        when(studentCommitmentRepository.findByStudentIdAndCommitmentStatusAndEffectiveFromTimestampLessThanEqual(
                studentId, CommitmentStatus.ATTENDING, t)).thenReturn(List.of(c1));

        // Act
        List<StudentCommitment> list = studentCommitmentService.getCurrentActiveCommitments(studentId, t);

        // Assert
        assertEquals(1, list.size());
        verify(studentCommitmentRepository).findByStudentIdAndCommitmentStatusAndEffectiveFromTimestampLessThanEqual(
                studentId, CommitmentStatus.ATTENDING, t);
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

    private StudentPlanAssignment buildAssignmentWithPlan(int maxDays) {
        StudentPlan plan = new StudentPlan();
        plan.setMaxDays(maxDays);
        StudentPlanAssignment assign = new StudentPlanAssignment();
        assign.setPlan(plan);
        return assign;
    }

    @Test
    void bulkUpdateCommitments_attending_withinPlanLimit_savesEach() {
        // Arrange
        List<UUID> seriesIds = List.of(UUID.randomUUID(), UUID.randomUUID());
        when(studentPlanService.getCurrentAssignment(studentId)).thenReturn(Optional.of(buildAssignmentWithPlan(5)));
        when(studentCommitmentRepository.findByStudentIdAndCommitmentStatusAndEffectiveFromTimestampLessThanEqual(
                eq(studentId), eq(CommitmentStatus.ATTENDING), any(Instant.class)))
                .thenReturn(List.of()); // currently no active commitments

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
        when(studentPlanService.getCurrentAssignment(studentId)).thenReturn(Optional.empty());

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
        when(studentPlanService.getCurrentAssignment(studentId)).thenReturn(Optional.of(buildAssignmentWithPlan(3)));
        // already has 1 active, adding 3 would exceed maxDays(3)
        when(studentCommitmentRepository.findByStudentIdAndCommitmentStatusAndEffectiveFromTimestampLessThanEqual(
                eq(studentId), eq(CommitmentStatus.ATTENDING), any(Instant.class)))
                .thenReturn(List.of(commitment(null, studentId, UUID.randomUUID(), CommitmentStatus.ATTENDING, Instant.now().minusSeconds(100))));

        // Act + Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                studentCommitmentService.bulkUpdateCommitments(studentId, seriesIds, CommitmentStatus.ATTENDING));
        assertTrue(ex.getMessage().toLowerCase().contains("exceed maximum"), "Unexpected message: " + ex.getMessage());
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
        verify(studentPlanService, never()).getCurrentAssignment(any());
    }

    @Test
    void updateCommitment_attending_singleUpdate_doesNotValidatePlanLimits_currently() {
        // Arrange: in service code, single update does not call validatePlanLimits (commented out)
        when(studentCommitmentRepository.save(any(StudentCommitment.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        StudentCommitment saved = studentCommitmentService.updateCommitment(studentId, seriesId, CommitmentStatus.ATTENDING);

        // Assert: ensure no call to plan service happened
        verify(studentPlanService, never()).getCurrentAssignment(any());
        assertEquals(CommitmentStatus.ATTENDING, saved.getCommitmentStatus());
    }
}

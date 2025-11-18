package org.conexaotreinamento.conexaotreinamentobackend.unit.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AssignPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanAssignmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlan;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlanAssignment;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.StudentPlanMapper;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanAssignmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentCommitmentService;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentPlanService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.BusinessException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ResourceNotFoundException;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class StudentPlanServiceTest {

    @Mock
    private StudentPlanRepository studentPlanRepository;
    @Mock
    private StudentPlanAssignmentRepository assignmentRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private StudentCommitmentService studentCommitmentService;

    private StudentPlanMapper planMapper = new StudentPlanMapper();

    @InjectMocks
    private StudentPlanService studentPlanService;

    private UUID planId;
    private UUID studentId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        planId = UUID.randomUUID();
        studentId = UUID.randomUUID();
        userId = UUID.randomUUID();
        
        // Inject real mapper into service
        ReflectionTestUtils.setField(studentPlanService, "planMapper", planMapper);
    }

    private StudentPlan newPlan(UUID id, String name, int maxDays, int durationDays, boolean active) {
        StudentPlan p = new StudentPlan();
        p.setId(id);
        p.setName(name);
        p.setMaxDays(maxDays);
        p.setDurationDays(durationDays);
        p.setDescription("desc");
        p.setActive(active);
        return p;
    }

    private StudentPlanAssignment assignment(UUID id, UUID studentId, UUID planId, LocalDate start, LocalDate endExclusive, UUID assignedBy) {
        StudentPlanAssignment a = new StudentPlanAssignment();
        a.setId(id);
        a.setStudentId(studentId);
        a.setPlanId(planId);
        a.setStartDate(start);
        a.setDurationDays((int) Math.max(0, ChronoUnit.DAYS.between(start, endExclusive)));
        a.setAssignedByUserId(assignedBy);
        a.setAssignmentNotes("notes");
        return a;
    }

    @Test
    void createPlan_success_whenNameNotExists() {
        // Arrange
        StudentPlanRequestDTO req = new StudentPlanRequestDTO("Gold", 3, 30, "desc");
        when(studentPlanRepository.existsByName("Gold")).thenReturn(false);
        when(studentPlanRepository.save(any(StudentPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        StudentPlanResponseDTO dto = studentPlanService.createPlan(req);

        // Assert
        assertEquals("Gold", dto.name());
        assertEquals(3, dto.maxDays());
        assertEquals(30, dto.durationDays());
        assertTrue(dto.active());
        verify(studentPlanRepository).save(any(StudentPlan.class));
    }

    @Test
    void createPlan_conflict_whenNameExists() {
        // Arrange
        StudentPlanRequestDTO req = new StudentPlanRequestDTO("Gold", 3, 30, "desc");
        when(studentPlanRepository.existsByName("Gold")).thenReturn(true);

        // Act + Assert
        assertThrows(BusinessException.class, () -> studentPlanService.createPlan(req));
        verify(studentPlanRepository, never()).save(any());
    }

    @Test
    void deletePlan_success_softDeletes_whenNoActiveAssignments() {
        // Arrange
        StudentPlan plan = newPlan(planId, "Silver", 2, 14, true);
        when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.of(plan));
        when(studentPlanRepository.save(any(StudentPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        studentPlanService.deletePlan(planId);

        // Assert
        assertFalse(plan.isActive(), "Plan should be soft-deleted");
        verify(studentPlanRepository).save(plan);
    }

    @Test
    void deletePlan_softDeletes_evenWhenActiveAssignmentsExist() {
        // Arrange
        StudentPlan plan = newPlan(planId, "Silver", 2, 14, true);
        when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.of(plan));

        // Act
        studentPlanService.deletePlan(planId);

        // Assert
        assertFalse(plan.isActive(), "Plan should be soft deleted even with active assignments");
        verify(studentPlanRepository).save(plan);
    }

    @Test
    void deletePlan_notFound_throws404() {
        // Arrange
        when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(ResourceNotFoundException.class, () -> studentPlanService.deletePlan(planId));
    }

    @Test
    void restorePlan_success_activatesInactivePlan() {
        // Arrange
        StudentPlan inactive = newPlan(planId, "Silver", 2, 14, false);
        when(studentPlanRepository.findById(planId)).thenReturn(Optional.of(inactive));
        when(studentPlanRepository.save(any(StudentPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        StudentPlanResponseDTO dto = studentPlanService.restorePlan(planId);

        // Assert
        assertTrue(dto.active());
        verify(studentPlanRepository).save(inactive);
    }

    @Test
    void restorePlan_notFound_throws404() {
        // Arrange
        when(studentPlanRepository.findById(planId)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(ResourceNotFoundException.class, () -> studentPlanService.restorePlan(planId));
    }

    @Test
    void restorePlan_alreadyActive_conflict() {
        // Arrange
        StudentPlan active = newPlan(planId, "Gold", 3, 30, true);
        when(studentPlanRepository.findById(planId)).thenReturn(Optional.of(active));

        // Act + Assert
        assertThrows(BusinessException.class, () -> studentPlanService.restorePlan(planId));
        verify(studentPlanRepository, never()).save(any());
    }

    @Test
    void getAllActivePlans_returnsMappedList() {
        // Arrange
        StudentPlan p1 = newPlan(UUID.randomUUID(), "A", 2, 14, true);
        StudentPlan p2 = newPlan(UUID.randomUUID(), "B", 4, 30, true);
        when(studentPlanRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(p1, p2));

        // Act
        List<StudentPlanResponseDTO> list = studentPlanService.getAllActivePlans();

        // Assert
        assertEquals(2, list.size());
        assertEquals("A", list.get(0).name());
        assertEquals("B", list.get(1).name());
    }

    @Test
    void getPlanById_success_returnsDTO() {
        // Arrange
        StudentPlan p = newPlan(planId, "Prime", 5, 60, true);
        when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.of(p));

        // Act
        StudentPlanResponseDTO dto = studentPlanService.getPlanById(planId);

        // Assert
        assertEquals(planId, dto.id());
        assertEquals("Prime", dto.name());
        assertTrue(dto.active());
    }

    @Test
    void getPlanById_notFound_throws404() {
        // Arrange
        when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(ResourceNotFoundException.class, () -> studentPlanService.getPlanById(planId));
    }

    @Test
    void assignPlanToStudent_notFoundStudent_throws404() {
        // Arrange
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        AssignPlanRequestDTO req = new AssignPlanRequestDTO(planId, LocalDate.now(), "notes");

        // Act + Assert
        assertThrows(ResourceNotFoundException.class, () -> studentPlanService.assignPlanToStudent(studentId, req, userId));
    }

    @Test
    void assignPlanToStudent_notFoundPlan_throws404() {
        // Arrange
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(new Student("s@example.com", "Stu", "Dent", Student.Gender.M, LocalDate.of(1990, 1, 1))));
        when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.empty());

        AssignPlanRequestDTO req = new AssignPlanRequestDTO(planId, LocalDate.now(), "notes");

        // Act + Assert
        assertThrows(ResourceNotFoundException.class, () -> studentPlanService.assignPlanToStudent(studentId, req, userId));
    }

    @Test
    void getStudentPlanHistory_success_mapsList() {
        // Arrange
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(new Student("s@example.com", "Stu", "Dent", Student.Gender.M, LocalDate.of(1990, 1, 1))));
        StudentPlanAssignment a = assignment(UUID.randomUUID(), studentId, planId, LocalDate.now().minusDays(5), LocalDate.now().plusDays(5), userId);
        when(assignmentRepository.findByStudentIdOrderByStartDateDesc(studentId)).thenReturn(List.of(a));

        // Act
        List<StudentPlanAssignmentResponseDTO> list = studentPlanService.getStudentPlanHistory(studentId);

        // Assert
        assertEquals(1, list.size());
        assertEquals(studentId, list.get(0).studentId());
    }

    @Test
    void getStudentPlanHistory_notFoundStudent_throws404() {
        // Arrange
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(ResourceNotFoundException.class, () -> studentPlanService.getStudentPlanHistory(studentId));
    }

    @Test
    void getCurrentStudentPlan_success_mapsDTO() {
        // Arrange
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(new Student("s@example.com", "Stu", "Dent", Student.Gender.M, LocalDate.of(1990, 1, 1))));
        StudentPlanAssignment a = assignment(UUID.randomUUID(), studentId, planId, LocalDate.now().minusDays(1), LocalDate.now().plusDays(9), userId);
        when(assignmentRepository.findCurrentActiveAssignment(studentId)).thenReturn(Optional.of(a));

        // Act
        StudentPlanAssignmentResponseDTO dto = studentPlanService.getCurrentStudentPlan(studentId);

        // Assert
        assertEquals(studentId, dto.studentId());
        assertTrue(dto.active());
    }

    @Test
    void getCurrentStudentPlan_notFound_throws404() {
        // Arrange
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(new Student("s@example.com", "Stu", "Dent", Student.Gender.M, LocalDate.of(1990, 1, 1))));
        when(assignmentRepository.findCurrentActiveAssignment(studentId)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(ResourceNotFoundException.class, () -> studentPlanService.getCurrentStudentPlan(studentId));
    }

    @Test
    void getCurrentAssignment_returnsOptionalFromRepository() {
        // Arrange
        StudentPlanAssignment a = assignment(UUID.randomUUID(), studentId, planId, LocalDate.now(), LocalDate.now().plusDays(10), userId);
        when(assignmentRepository.findCurrentActiveAssignment(studentId)).thenReturn(Optional.of(a));

        // Act
        Optional<StudentPlanAssignment> opt = studentPlanService.getCurrentAssignment(studentId);

        // Assert
        assertTrue(opt.isPresent());
        assertEquals(a.getId(), opt.get().getId());
    }

    @Test
    void getExpiringSoonAssignments_returnsMappedList() {
        // Arrange
        StudentPlanAssignment a = assignment(UUID.randomUUID(), studentId, planId, LocalDate.now(), LocalDate.now().plusDays(2), userId);
        when(assignmentRepository.findExpiringSoon(any(LocalDate.class))).thenReturn(List.of(a));

        // Act
        List<StudentPlanAssignmentResponseDTO> list = studentPlanService.getExpiringSoonAssignments(7);

        // Assert
        assertEquals(1, list.size());
        assertEquals(planId, list.get(0).planId());
    }

    @Test
    void getAllCurrentlyActiveAssignments_returnsMappedList() {
        // Arrange
        StudentPlanAssignment a = assignment(UUID.randomUUID(), studentId, planId, LocalDate.now(), LocalDate.now().plusDays(10), userId);
        when(assignmentRepository.findAllCurrentlyActive()).thenReturn(List.of(a));

        // Act
        List<StudentPlanAssignmentResponseDTO> list = studentPlanService.getAllCurrentlyActiveAssignments();

        // Assert
        assertEquals(1, list.size());
        assertEquals(studentId, list.get(0).studentId());
    }

    @Test
    void assignPlanToStudent_reusesRemainingDurationAndResetsSchedule() {
        // Arrange
        UUID oldPlanId = UUID.randomUUID();
        StudentPlan oldPlan = newPlan(oldPlanId, "Old", 4, 30, true);
        StudentPlan newPlan = newPlan(planId, "New", 2, 45, true);
        Student student = new Student("s@example.com", "Stu", "Dent", Student.Gender.M, LocalDate.of(1990, 1, 1));

    LocalDate oldStart = LocalDate.now().minusDays(10);
    LocalDate oldEndExclusive = oldStart.plusDays(30);
    StudentPlanAssignment currentAssignment = assignment(UUID.randomUUID(), studentId, oldPlanId, oldStart, oldEndExclusive, userId);
    currentAssignment.setDurationDays(30);

        LocalDate newStart = LocalDate.now();
        AssignPlanRequestDTO request = new AssignPlanRequestDTO(planId, newStart, "upgrade");

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.of(newPlan));
        when(studentPlanRepository.findById(oldPlanId)).thenReturn(Optional.of(oldPlan));
        when(assignmentRepository.findCurrentActiveAssignment(studentId)).thenReturn(Optional.of(currentAssignment));
        when(assignmentRepository.findOverlappingAssignments(eq(studentId), any(LocalDate.class), any(LocalDate.class)))
            .thenAnswer(inv -> new java.util.ArrayList<>(List.of(currentAssignment)));
        when(assignmentRepository.save(any(StudentPlanAssignment.class))).thenAnswer(inv -> (StudentPlanAssignment) inv.getArgument(0));

        // Act
        StudentPlanAssignmentResponseDTO response = studentPlanService.assignPlanToStudent(studentId, request, userId);

        // Assert
        assertEquals(20, response.durationDays());
        assertEquals(10, currentAssignment.getDurationDays());
        assertEquals(newStart, currentAssignment.getEndDateExclusive());
        verify(studentCommitmentService).resetScheduleIfExceedsPlan(studentId, newPlan.getMaxDays());
    }

    @Test
    void assignPlanToStudent_doesNotTruncateDurationWhenNoOverlap() {
        // Arrange
        UUID oldPlanId = UUID.randomUUID();
        StudentPlan oldPlan = newPlan(oldPlanId, "Old", 4, 10, true);
        StudentPlan newPlan = newPlan(planId, "New", 2, 45, true);
        Student student = new Student("s@example.com", "Stu", "Dent", Student.Gender.M, LocalDate.of(1990, 1, 1));

        LocalDate oldStart = LocalDate.now().minusDays(5);
        LocalDate newStart = oldStart.plusDays(oldPlan.getDurationDays());
        StudentPlanAssignment currentAssignment = assignment(UUID.randomUUID(), studentId, oldPlanId, oldStart, oldStart.plusDays(oldPlan.getDurationDays()), userId);
        currentAssignment.setDurationDays(oldPlan.getDurationDays());

        AssignPlanRequestDTO request = new AssignPlanRequestDTO(planId, newStart, "upgrade");

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.of(newPlan));
        when(studentPlanRepository.findById(oldPlanId)).thenReturn(Optional.of(oldPlan));
        when(assignmentRepository.findCurrentActiveAssignment(studentId)).thenReturn(Optional.of(currentAssignment));
        when(assignmentRepository.findOverlappingAssignments(eq(studentId), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(new java.util.ArrayList<>());
        when(assignmentRepository.save(any(StudentPlanAssignment.class))).thenAnswer(inv -> (StudentPlanAssignment) inv.getArgument(0));

        // Act
        StudentPlanAssignmentResponseDTO response = studentPlanService.assignPlanToStudent(studentId, request, userId);

        // Assert
        assertEquals(newPlan.getDurationDays(), response.durationDays());
        assertEquals(oldPlan.getDurationDays(), currentAssignment.getDurationDays());
        verify(studentCommitmentService).resetScheduleIfExceedsPlan(studentId, newPlan.getMaxDays());
    }
}

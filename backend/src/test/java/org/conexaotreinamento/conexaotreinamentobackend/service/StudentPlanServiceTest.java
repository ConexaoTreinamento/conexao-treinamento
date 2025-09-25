package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AssignPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanAssignmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlan;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlanAssignment;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanAssignmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentPlanServiceTest {

    @Mock
    private StudentPlanRepository studentPlanRepository;
    @Mock
    private StudentPlanAssignmentRepository assignmentRepository;
    @Mock
    private StudentRepository studentRepository;

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

    private StudentPlanAssignment assignment(UUID id, UUID studentId, UUID planId, LocalDate start, LocalDate end, UUID assignedBy) {
        StudentPlanAssignment a = new StudentPlanAssignment();
        a.setId(id);
        a.setStudentId(studentId);
        a.setPlanId(planId);
        a.setStartDate(start);
        a.setEndDate(end);
        a.setAssignedByUserId(assignedBy);
        a.setAssignmentNotes("notes");
        return a;
    }

    @Test
    void createPlan_success_whenNameNotExists() {
        // Arrange
        StudentPlanRequestDTO req = new StudentPlanRequestDTO("Gold", 3, 30, "desc");
        when(studentPlanRepository.existsByNameAndActiveTrue("Gold")).thenReturn(false);
        when(studentPlanRepository.save(any(StudentPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        StudentPlanResponseDTO dto = studentPlanService.createPlan(req);

        // Assert
        assertEquals("Gold", dto.getName());
        assertEquals(3, dto.getMaxDays());
        assertEquals(30, dto.getDurationDays());
        assertTrue(dto.getActive());
        verify(studentPlanRepository).save(any(StudentPlan.class));
    }

    @Test
    void createPlan_conflict_whenNameExists() {
        // Arrange
        StudentPlanRequestDTO req = new StudentPlanRequestDTO("Gold", 3, 30, "desc");
        when(studentPlanRepository.existsByNameAndActiveTrue("Gold")).thenReturn(true);

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentPlanService.createPlan(req));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(studentPlanRepository, never()).save(any());
    }

    @Test
    void deletePlan_success_softDeletes_whenNoActiveAssignments() {
        // Arrange
        StudentPlan plan = newPlan(planId, "Silver", 2, 14, true);
        when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.of(plan));
        when(assignmentRepository.findAllCurrentlyActive()).thenReturn(List.of()); // no active assignments
        when(studentPlanRepository.save(any(StudentPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        studentPlanService.deletePlan(planId);

        // Assert
        assertFalse(plan.isActive(), "Plan should be soft-deleted");
        verify(studentPlanRepository).save(plan);
    }

    @Test
    void deletePlan_conflict_whenActiveAssignmentsExist() {
        // Arrange
        StudentPlan plan = newPlan(planId, "Silver", 2, 14, true);
        when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.of(plan));
        StudentPlanAssignment activeAssign = assignment(UUID.randomUUID(), studentId, planId, LocalDate.now(), LocalDate.now().plusDays(14), userId);
        when(assignmentRepository.findAllCurrentlyActive()).thenReturn(List.of(activeAssign));

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentPlanService.deletePlan(planId));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(studentPlanRepository, never()).save(any());
    }

    @Test
    void deletePlan_notFound_throws404() {
        // Arrange
        when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.empty());

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentPlanService.deletePlan(planId));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
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
        assertEquals("A", list.get(0).getName());
        assertEquals("B", list.get(1).getName());
    }

    @Test
    void getPlanById_success_returnsDTO() {
        // Arrange
        StudentPlan p = newPlan(planId, "Prime", 5, 60, true);
        when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.of(p));

        // Act
        StudentPlanResponseDTO dto = studentPlanService.getPlanById(planId);

        // Assert
        assertEquals(planId, dto.getId());
        assertEquals("Prime", dto.getName());
        assertTrue(dto.getActive());
    }

    @Test
    void getPlanById_notFound_throws404() {
        // Arrange
        when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.empty());

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentPlanService.getPlanById(planId));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void assignPlanToStudent_notFoundStudent_throws404() {
        // Arrange
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        AssignPlanRequestDTO req = new AssignPlanRequestDTO(planId, LocalDate.now(), "notes");

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentPlanService.assignPlanToStudent(studentId, req, userId));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void assignPlanToStudent_notFoundPlan_throws404() {
        // Arrange
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(new Student("s@example.com", "Stu", "Dent", Student.Gender.M, LocalDate.of(1990, 1, 1))));
        when(studentPlanRepository.findByIdAndActiveTrue(planId)).thenReturn(Optional.empty());

        AssignPlanRequestDTO req = new AssignPlanRequestDTO(planId, LocalDate.now(), "notes");

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentPlanService.assignPlanToStudent(studentId, req, userId));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
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
        assertEquals(studentId, list.get(0).getStudentId());
    }

    @Test
    void getStudentPlanHistory_notFoundStudent_throws404() {
        // Arrange
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentPlanService.getStudentPlanHistory(studentId));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
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
        assertEquals(studentId, dto.getStudentId());
        assertTrue(dto.isActive());
    }

    @Test
    void getCurrentStudentPlan_notFound_throws404() {
        // Arrange
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(new Student("s@example.com", "Stu", "Dent", Student.Gender.M, LocalDate.of(1990, 1, 1))));
        when(assignmentRepository.findCurrentActiveAssignment(studentId)).thenReturn(Optional.empty());

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentPlanService.getCurrentStudentPlan(studentId));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
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
        assertEquals(planId, list.get(0).getPlanId());
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
        assertEquals(studentId, list.get(0).getStudentId());
    }
}

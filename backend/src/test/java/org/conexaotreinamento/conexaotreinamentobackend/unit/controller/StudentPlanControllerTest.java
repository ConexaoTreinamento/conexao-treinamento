package org.conexaotreinamento.conexaotreinamentobackend.unit.controller;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AssignPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanAssignmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentPlanService;
import org.conexaotreinamento.conexaotreinamentobackend.controller.StudentPlanController;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.service.UserService;
import org.conexaotreinamento.conexaotreinamentobackend.controller.StudentPlanController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class StudentPlanControllerTest {

    @Mock
    private StudentPlanService studentPlanService;

    @Mock
    private UserService userService;

    @InjectMocks
    private StudentPlanController controller;

    private MockMvc mockMvc;

    private UUID planId;
    private UUID studentId;
    private UUID userId;
    private String adminEmail = "admin@example.com";

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        planId = UUID.randomUUID();
        studentId = UUID.randomUUID();
        userId = UUID.randomUUID();
        // Clear any previous security context
        SecurityContextHolder.clearContext();
    }

    private StudentPlanResponseDTO planDto(UUID id, String name, int maxDays, int durationDays, boolean isActive) {
        StudentPlanResponseDTO dto = new StudentPlanResponseDTO();
        dto.setId(id);
        dto.setName(name);
        dto.setMaxDays(maxDays);
        dto.setDurationDays(durationDays);
        dto.setDescription("desc");
        dto.setIsActive(isActive);
        return dto;
    }

    private StudentPlanAssignmentResponseDTO assignDto(UUID assignmentId, UUID studentId, UUID planId, String studentName, String planName, String assignedByEmail) {
        StudentPlanAssignmentResponseDTO dto = new StudentPlanAssignmentResponseDTO();
        dto.setId(assignmentId);
        dto.setStudentId(studentId);
        dto.setPlanId(planId);
        dto.setStudentName(studentName);
        dto.setPlanName(planName);
        dto.setAssignedByUserEmail(assignedByEmail);
        dto.setStartDate(LocalDate.now());
        dto.setDurationDays(10);
        dto.setActive(true);
        dto.setDaysRemaining(10);
        return dto;
    }

    @Test
    void getAllPlans_returnsOk_listOfPlans() throws Exception {
        // Arrange
        when(studentPlanService.getPlansByStatus("isActive")).thenReturn(List.of(
                planDto(UUID.randomUUID(), "Gold", 3, 30, true),
                planDto(UUID.randomUUID(), "Silver", 2, 14, true)
        ));

        // Act + Assert
        mockMvc.perform(get("/plans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Gold"))
                .andExpect(jsonPath("$[1].durationDays").value(14));
    }

    @Test
    void getPlanById_returnsOk_singlePlan() throws Exception {
        // Arrange
        StudentPlanResponseDTO dto = planDto(planId, "Prime", 5, 60, true);
        when(studentPlanService.getPlanById(planId)).thenReturn(dto);

        // Act + Assert
        mockMvc.perform(get("/plans/{planId}", planId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(planId.toString()))
                .andExpect(jsonPath("$.name").value("Prime"))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    void createPlan_valid_returns201() throws Exception {
        // Arrange
        String body = "{"
                + "\"name\":\"Bronze\","
                + "\"maxDays\":1,"
                + "\"durationDays\":7,"
                + "\"description\":\"starter\""
                + "}";
        StudentPlanResponseDTO saved = planDto(UUID.randomUUID(), "Bronze", 1, 7, true);
        when(studentPlanService.createPlan(any(StudentPlanRequestDTO.class))).thenReturn(saved);

        // Act + Assert
        mockMvc.perform(post("/plans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Bronze"))
                .andExpect(jsonPath("$.durationDays").value(7));
    }

    @Test
    void deletePlan_returns204_andInvokesService() throws Exception {
        // Act + Assert
        mockMvc.perform(delete("/plans/{planId}", planId))
                .andExpect(status().isNoContent());

        verify(studentPlanService).deletePlan(planId);
    }

    @Test
    void restorePlan_returnsOk_andInvokesService() throws Exception {
        // Arrange
        StudentPlanResponseDTO restored = planDto(planId, "Silver", 2, 14, true);
        when(studentPlanService.restorePlan(planId)).thenReturn(restored);

        // Act + Assert
        mockMvc.perform(post("/plans/{planId}/restore", planId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(planId.toString()))
                .andExpect(jsonPath("$.isActive").value(true));

        verify(studentPlanService).restorePlan(planId);
    }

    @Test
    void assignPlanToStudent_validAuth_returns201_andUsesAuthPrincipalAsUserId() throws Exception {
        // Arrange security context
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn(adminEmail);
        org.springframework.security.core.context.SecurityContext securityContext = mock(org.springframework.security.core.context.SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

    // Mock user lookup by email to provide the expected userId
    when(userService.getUserByEmail(adminEmail))
        .thenReturn(java.util.Optional.of(new UserResponseDTO(userId, adminEmail, Role.ROLE_ADMIN)));

    AssignPlanRequestDTO req = new AssignPlanRequestDTO(planId, LocalDate.now(), "notes");
        StudentPlanAssignmentResponseDTO assigned = assignDto(UUID.randomUUID(), studentId, planId, "Stu Dent", "Gold", adminEmail);
        when(studentPlanService.assignPlanToStudent(eq(studentId), any(AssignPlanRequestDTO.class), eq(userId)))
                .thenReturn(assigned);

        String body = "{"
                + "\"planId\":\"" + planId + "\","
                + "\"startDate\":\"" + LocalDate.now().toString() + "\","
                + "\"assignmentNotes\":\"notes\""
                + "}";

        // Act + Assert
        mockMvc.perform(post("/plans/students/{studentId}/assign", studentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value(studentId.toString()))
                .andExpect(jsonPath("$.planId").value(planId.toString()))
                .andExpect(jsonPath("$.studentName").value("Stu Dent"))
                .andExpect(jsonPath("$.planName").value("Gold"));

        // Ensure service invoked with authenticated user UUID
        verify(studentPlanService).assignPlanToStudent(eq(studentId), any(AssignPlanRequestDTO.class), eq(userId));
    }

    @Test
    void getStudentPlanHistory_returnsOk_list() throws Exception {
        // Arrange
        StudentPlanAssignmentResponseDTO a = assignDto(UUID.randomUUID(), studentId, planId, "Stu Dent", "Gold", "u@example.com");
        when(studentPlanService.getStudentPlanHistory(studentId)).thenReturn(List.of(a));

        // Act + Assert
        mockMvc.perform(get("/plans/students/{studentId}/history", studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentId").value(studentId.toString()));
    }

    @Test
    void getCurrentStudentPlan_returnsOk_single() throws Exception {
        // Arrange
        StudentPlanAssignmentResponseDTO a = assignDto(UUID.randomUUID(), studentId, planId, "Stu Dent", "Gold", "u@example.com");
        when(studentPlanService.getCurrentStudentPlan(studentId)).thenReturn(a);

        // Act + Assert
        mockMvc.perform(get("/plans/students/{studentId}/current", studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planId").value(planId.toString()))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    void getExpiringSoonAssignments_returnsOk_list() throws Exception {
        // Arrange
        StudentPlanAssignmentResponseDTO a = assignDto(UUID.randomUUID(), studentId, planId, "Stu Dent", "Gold", "u@example.com");
        when(studentPlanService.getExpiringSoonAssignments(7)).thenReturn(List.of(a));

        // Act + Assert
        mockMvc.perform(get("/plans/assignments/expiring-soon")
                        .param("days", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].daysRemaining").value(10));
    }

    @Test
    void getAllActiveAssignments_returnsOk_list() throws Exception {
        // Arrange
        StudentPlanAssignmentResponseDTO a = assignDto(UUID.randomUUID(), studentId, planId, "Stu Dent", "Gold", "u@example.com");
        when(studentPlanService.getAllCurrentlyActiveAssignments()).thenReturn(List.of(a));

        // Act + Assert
        mockMvc.perform(get("/plans/assignments/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentId").value(studentId.toString()));
    }
}

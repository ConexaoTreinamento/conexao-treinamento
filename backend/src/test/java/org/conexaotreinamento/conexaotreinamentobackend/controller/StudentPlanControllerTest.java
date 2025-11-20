package org.conexaotreinamento.conexaotreinamentobackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AssignPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanAssignmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentPlanService;
import org.conexaotreinamento.conexaotreinamentobackend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class StudentPlanControllerTest {

    private MockMvc mockMvc;

    @Mock
    private StudentPlanService studentPlanService;

    @Mock
    private UserService userService;

    @InjectMocks
    private StudentPlanController studentPlanController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(studentPlanController).build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules(); // For Java 8 date/time types
    }

    @Test
    void getAllPlans_ShouldReturnListOfPlans() throws Exception {
        StudentPlanResponseDTO plan1 = new StudentPlanResponseDTO(UUID.randomUUID(), "Plan 1", 30, 30, "Desc 1", true, Instant.now());
        StudentPlanResponseDTO plan2 = new StudentPlanResponseDTO(UUID.randomUUID(), "Plan 2", 60, 60, "Desc 2", true, Instant.now());
        List<StudentPlanResponseDTO> plans = Arrays.asList(plan1, plan2);

        when(studentPlanService.getPlansByStatus("active")).thenReturn(plans);

        mockMvc.perform(get("/plans")
                .param("status", "active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Plan 1"))
                .andExpect(jsonPath("$[1].name").value("Plan 2"));
    }

    @Test
    void getPlanById_ShouldReturnPlan() throws Exception {
        UUID planId = UUID.randomUUID();
        StudentPlanResponseDTO plan = new StudentPlanResponseDTO(planId, "Plan 1", 30, 30, "Desc 1", true, Instant.now());

        when(studentPlanService.getPlanById(planId)).thenReturn(plan);

        mockMvc.perform(get("/plans/{planId}", planId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(planId.toString()))
                .andExpect(jsonPath("$.name").value("Plan 1"));
    }

    @Test
    void createPlan_ShouldReturnCreatedPlan() throws Exception {
        StudentPlanRequestDTO requestDTO = new StudentPlanRequestDTO("New Plan", 30, 30, "Description");
        StudentPlanResponseDTO responseDTO = new StudentPlanResponseDTO(UUID.randomUUID(), "New Plan", 30, 30, "Description", true, Instant.now());

        when(studentPlanService.createPlan(any(StudentPlanRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/plans")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Plan"));
    }

    @Test
    void deletePlan_ShouldReturnNoContent() throws Exception {
        UUID planId = UUID.randomUUID();

        mockMvc.perform(delete("/plans/{planId}", planId))
                .andExpect(status().isNoContent());
    }

    @Test
    void restorePlan_ShouldReturnRestoredPlan() throws Exception {
        UUID planId = UUID.randomUUID();
        StudentPlanResponseDTO restoredPlan = new StudentPlanResponseDTO(planId, "Restored Plan", 30, 30, "Desc", true, Instant.now());

        when(studentPlanService.restorePlan(planId)).thenReturn(restoredPlan);

        mockMvc.perform(post("/plans/{planId}/restore", planId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Restored Plan"));
    }

    @Test
    void assignPlanToStudent_ShouldReturnAssignment() throws Exception {
        UUID studentId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String userEmail = "admin@example.com";

        AssignPlanRequestDTO requestDTO = new AssignPlanRequestDTO(planId, LocalDate.now(), "Notes");
        StudentPlanAssignmentResponseDTO responseDTO = new StudentPlanAssignmentResponseDTO(
                UUID.randomUUID(), studentId, "Student Name", planId, "Plan Name", 30, 30, 30, LocalDate.now(),
                userId, userEmail, "Notes", Instant.now(), true, false, false, 30
        );

        UserResponseDTO userResponseDTO = new UserResponseDTO(userId, userEmail, Role.ROLE_ADMIN);

        // Mock SecurityContext
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(userEmail);
        SecurityContextHolder.setContext(securityContext);

        when(userService.getUserByEmail(userEmail)).thenReturn(Optional.of(userResponseDTO));
        when(studentPlanService.assignPlanToStudent(eq(studentId), any(AssignPlanRequestDTO.class), eq(userId)))
                .thenReturn(responseDTO);

        mockMvc.perform(post("/plans/students/{studentId}/assign", studentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value(studentId.toString()))
                .andExpect(jsonPath("$.planId").value(planId.toString()));
    }

    @Test
    void assignPlanToStudent_ShouldReturnUnauthorized_WhenUserNotFound() throws Exception {
        UUID studentId = UUID.randomUUID();
        AssignPlanRequestDTO requestDTO = new AssignPlanRequestDTO(UUID.randomUUID(), LocalDate.now(), "Notes");
        String userEmail = "unknown@example.com";

        // Mock SecurityContext
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(userEmail);
        SecurityContextHolder.setContext(securityContext);

        when(userService.getUserByEmail(userEmail)).thenReturn(Optional.empty());

        mockMvc.perform(post("/plans/students/{studentId}/assign", studentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getStudentPlanHistory_ShouldReturnHistory() throws Exception {
        UUID studentId = UUID.randomUUID();
        StudentPlanAssignmentResponseDTO assignment1 = new StudentPlanAssignmentResponseDTO(
                UUID.randomUUID(), studentId, "Student", UUID.randomUUID(), "Plan 1", 30, 30, 30, LocalDate.now().minusDays(30),
                UUID.randomUUID(), "admin@example.com", "Notes", Instant.now(), false, true, false, 0
        );
        List<StudentPlanAssignmentResponseDTO> history = Arrays.asList(assignment1);

        when(studentPlanService.getStudentPlanHistory(studentId)).thenReturn(history);

        mockMvc.perform(get("/plans/students/{studentId}/history", studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getCurrentStudentPlan_ShouldReturnCurrentPlan() throws Exception {
        UUID studentId = UUID.randomUUID();
        StudentPlanAssignmentResponseDTO currentPlan = new StudentPlanAssignmentResponseDTO(
                UUID.randomUUID(), studentId, "Student", UUID.randomUUID(), "Plan 1", 30, 30, 30, LocalDate.now(),
                UUID.randomUUID(), "admin@example.com", "Notes", Instant.now(), true, false, false, 30
        );

        when(studentPlanService.getCurrentStudentPlan(studentId)).thenReturn(currentPlan);

        mockMvc.perform(get("/plans/students/{studentId}/current", studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value(studentId.toString()));
    }

    @Test
    void getExpiringSoonAssignments_ShouldReturnExpiringAssignments() throws Exception {
        StudentPlanAssignmentResponseDTO assignment = new StudentPlanAssignmentResponseDTO(
                UUID.randomUUID(), UUID.randomUUID(), "Student", UUID.randomUUID(), "Plan 1", 30, 30, 30, LocalDate.now(),
                UUID.randomUUID(), "admin@example.com", "Notes", Instant.now(), true, false, true, 5
        );
        List<StudentPlanAssignmentResponseDTO> expiring = Arrays.asList(assignment);

        when(studentPlanService.getExpiringSoonAssignments(7)).thenReturn(expiring);

        mockMvc.perform(get("/plans/assignments/expiring-soon")
                .param("days", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getAllActiveAssignments_ShouldReturnActiveAssignments() throws Exception {
        StudentPlanAssignmentResponseDTO assignment = new StudentPlanAssignmentResponseDTO(
                UUID.randomUUID(), UUID.randomUUID(), "Student", UUID.randomUUID(), "Plan 1", 30, 30, 30, LocalDate.now(),
                UUID.randomUUID(), "admin@example.com", "Notes", Instant.now(), true, false, false, 30
        );
        List<StudentPlanAssignmentResponseDTO> active = Arrays.asList(assignment);

        when(studentPlanService.getAllCurrentlyActiveAssignments()).thenReturn(active);

        mockMvc.perform(get("/plans/assignments/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }
}

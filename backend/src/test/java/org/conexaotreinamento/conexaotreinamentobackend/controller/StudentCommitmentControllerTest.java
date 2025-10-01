package org.conexaotreinamento.conexaotreinamentobackend.controller;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentCommitment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerScheduleRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentCommitmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class StudentCommitmentControllerTest {

    @Mock
    private StudentCommitmentService studentCommitmentService;

    @Mock
    private TrainerScheduleRepository trainerScheduleRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentCommitmentController controller;

    private MockMvc mockMvc;

    private UUID studentId;
    private UUID seriesId;

    @BeforeEach
    void setup() {
    mockMvc = MockMvcBuilders.standaloneSetup(controller)
        .setControllerAdvice(new org.conexaotreinamento.conexaotreinamentobackend.exception.GlobalExceptionHandler())
        .build();
        studentId = UUID.randomUUID();
        seriesId = UUID.randomUUID();
    }

    private StudentCommitment commitment(UUID id, CommitmentStatus status, Instant ts) {
        StudentCommitment c = new StudentCommitment();
        c.setId(id != null ? id : UUID.randomUUID());
        c.setStudentId(studentId);
        c.setSessionSeriesId(seriesId);
        c.setCommitmentStatus(status);
        c.setEffectiveFromTimestamp(ts != null ? ts : Instant.now());
        c.setCreatedAt(Instant.now());
        return c;
    }

    private Student student(UUID id, String name) {
        Student s = new Student("s@example.com", name, "Doe", Student.Gender.F, java.time.LocalDate.of(2000, 1, 1));
        // use reflection to set ID (private)
        try {
            java.lang.reflect.Field f = Student.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(s, id);
        } catch (Exception ignore) {}
        return s;
    }

    private TrainerSchedule schedule(UUID id, String seriesName) {
        TrainerSchedule ts = new TrainerSchedule();
        ts.setId(id);
        ts.setSeriesName(seriesName);
        return ts;
    }

    @Test
    void updateCommitment_success_returns201_andMapsDetailDTO() throws Exception {
        // Arrange
        StudentCommitment saved = commitment(UUID.randomUUID(), CommitmentStatus.ATTENDING, Instant.parse("2025-09-01T00:00:00Z"));
        when(studentCommitmentService.updateCommitment(eq(studentId), eq(seriesId), eq(CommitmentStatus.ATTENDING), any(Instant.class)))
                .thenReturn(saved);

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student(studentId, "Alice")));
        when(trainerScheduleRepository.findById(seriesId)).thenReturn(Optional.of(schedule(seriesId, "Yoga Basics")));

        String body = "{ \"commitmentStatus\": \"ATTENDING\", \"effectiveFromTimestamp\": \"2025-09-01T00:00:00Z\" }";

        // Act + Assert
        mockMvc.perform(post("/commitments/students/{studentId}/sessions/{sessionSeriesId}", studentId, seriesId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(saved.getId().toString()))
                .andExpect(jsonPath("$.studentId").value(studentId.toString()))
                .andExpect(jsonPath("$.sessionSeriesId").value(seriesId.toString()))
                .andExpect(jsonPath("$.commitmentStatus").value("ATTENDING"))
                .andExpect(jsonPath("$.studentName").value("Alice"))
                .andExpect(jsonPath("$.seriesName").value("Yoga Basics"));
    }

    @Test
    void updateCommitment_propagatesRuntimeException_whenServiceFails() throws Exception {
        when(studentCommitmentService.updateCommitment(any(), any(), any(), any())).thenThrow(new RuntimeException("oops"));

        String body = "{ \"commitmentStatus\": \"ATTENDING\" }";

    jakarta.servlet.ServletException ex = assertThrows(jakarta.servlet.ServletException.class,
                () -> mockMvc.perform(post("/commitments/students/{studentId}/sessions/{sessionSeriesId}", studentId, seriesId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)));
        Throwable cause = ex.getCause();
        assertNotNull(cause);
        assertTrue(cause instanceof RuntimeException);
        assertTrue(cause.getMessage().contains("oops"));
    }

    @Test
    void getCurrentCommitmentStatus_returnsOk_withEnumString() throws Exception {
        // Arrange
        when(studentCommitmentService.getCurrentCommitmentStatus(eq(studentId), eq(seriesId), any(Instant.class)))
                .thenReturn(CommitmentStatus.TENTATIVE);

        // Act + Assert
        mockMvc.perform(get("/commitments/students/{studentId}/sessions/{sessionSeriesId}/status", studentId, seriesId))
                .andExpect(status().isOk())
                .andExpect(content().string("\"TENTATIVE\""));
    }

    @Test
    void getStudentCommitments_returnsOk_andMapsList() throws Exception {
        // Arrange
        StudentCommitment c1 = commitment(UUID.randomUUID(), CommitmentStatus.ATTENDING, Instant.now());
        when(studentCommitmentService.getStudentCommitments(studentId)).thenReturn(List.of(c1));

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student(studentId, "Bob")));
        when(trainerScheduleRepository.findById(seriesId)).thenReturn(Optional.of(schedule(seriesId, "Power Yoga")));

        // Act + Assert
        mockMvc.perform(get("/commitments/students/{studentId}", studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].studentId").value(studentId.toString()))
                .andExpect(jsonPath("$[0].commitmentStatus").value("ATTENDING"))
                .andExpect(jsonPath("$[0].studentName").value("Bob"));
    }

    @Test
    void getSessionSeriesCommitments_returnsOk_andMapsList() throws Exception {
        // Arrange
        StudentCommitment c1 = commitment(UUID.randomUUID(), CommitmentStatus.NOT_ATTENDING, Instant.now());
        when(studentCommitmentService.getSessionSeriesCommitments(seriesId)).thenReturn(List.of(c1));

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student(studentId, "Carol")));
        when(trainerScheduleRepository.findById(seriesId)).thenReturn(Optional.of(schedule(seriesId, "Pilates")));

        // Act + Assert
        mockMvc.perform(get("/commitments/sessions/{sessionSeriesId}", seriesId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].commitmentStatus").value("NOT_ATTENDING"))
                .andExpect(jsonPath("$[0].seriesName").value("Pilates"));
    }

    @Test
    void getCurrentActiveCommitments_returnsOk_andMapsList() throws Exception {
        // Arrange
        StudentCommitment c1 = commitment(UUID.randomUUID(), CommitmentStatus.ATTENDING, Instant.now().minusSeconds(10));
        when(studentCommitmentService.getCurrentActiveCommitments(eq(studentId), any(Instant.class)))
                .thenReturn(List.of(c1));

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student(studentId, "Dave")));
        when(trainerScheduleRepository.findById(seriesId)).thenReturn(Optional.of(schedule(seriesId, "Evening Flow")));

        // Act + Assert
        mockMvc.perform(get("/commitments/students/{studentId}/active", studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].commitmentStatus").value("ATTENDING"))
                .andExpect(jsonPath("$[0].studentName").value("Dave"));
    }

    @Test
    void getCommitmentHistory_returnsOk_andMapsList() throws Exception {
        // Arrange
        StudentCommitment c1 = commitment(UUID.randomUUID(), CommitmentStatus.TENTATIVE, Instant.now().minusSeconds(100));
        when(studentCommitmentService.getCommitmentHistory(studentId, seriesId)).thenReturn(List.of(c1));

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student(studentId, "Eve")));
        when(trainerScheduleRepository.findById(seriesId)).thenReturn(Optional.of(schedule(seriesId, "Morning Strength")));

        // Act + Assert
        mockMvc.perform(get("/commitments/students/{studentId}/sessions/{sessionSeriesId}/history", studentId, seriesId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].commitmentStatus").value("TENTATIVE"))
                .andExpect(jsonPath("$[0].seriesName").value("Morning Strength"));
    }

    @Test
    void bulkUpdateCommitments_success_returns201_andMapsList() throws Exception {
        // Arrange
        UUID s1 = UUID.randomUUID();
        UUID s2 = UUID.randomUUID();
        StudentCommitment c1 = commitment(UUID.randomUUID(), CommitmentStatus.ATTENDING, Instant.parse("2025-09-01T00:00:00Z"));
        StudentCommitment c2 = commitment(UUID.randomUUID(), CommitmentStatus.ATTENDING, Instant.parse("2025-09-01T00:00:00Z"));
        when(studentCommitmentService.bulkUpdateCommitments(eq(studentId), anyList(), eq(CommitmentStatus.ATTENDING), any()))
                .thenReturn(List.of(c1, c2));

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student(studentId, "Frank")));
        when(trainerScheduleRepository.findById(any(UUID.class))).thenReturn(Optional.of(schedule(seriesId, "Series X")));

        String body = "{ \"sessionSeriesIds\": [\"" + s1 + "\", \"" + s2 + "\"], \"commitmentStatus\": \"ATTENDING\", \"effectiveFromTimestamp\": \"2025-09-01T00:00:00Z\" }";

        // Act + Assert
        mockMvc.perform(post("/commitments/students/{studentId}/bulk", studentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].commitmentStatus").value("ATTENDING"))
                .andExpect(jsonPath("$[1].commitmentStatus").value("ATTENDING"));
    }

    @Test
    void bulkUpdateCommitments_propagatesRuntimeException_whenServiceFails() throws Exception {
        when(studentCommitmentService.bulkUpdateCommitments(any(), anyList(), any(), any())).thenThrow(new RuntimeException("bad"));

        String body = "{ \"sessionSeriesIds\": [\"" + UUID.randomUUID() + "\"], \"commitmentStatus\": \"NOT_ATTENDING\" }";

    jakarta.servlet.ServletException ex = assertThrows(jakarta.servlet.ServletException.class,
                () -> mockMvc.perform(post("/commitments/students/{studentId}/bulk", studentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)));
        Throwable cause = ex.getCause();
        assertNotNull(cause);
        assertTrue(cause instanceof RuntimeException);
        assertTrue(cause.getMessage().contains("bad"));
    }

    @Test
    void availableSessions_returnsOk_listFromRepository() throws Exception {
        // Arrange
        TrainerSchedule ts = new TrainerSchedule();
        ts.setId(UUID.randomUUID());
        ts.setSeriesName("Public Series");
        when(trainerScheduleRepository.findByActiveTrue()).thenReturn(List.of(ts));

        // Act + Assert
        mockMvc.perform(get("/commitments/available-sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].seriesName").value("Public Series"));

        verify(trainerScheduleRepository).findByActiveTrue();
    }
}

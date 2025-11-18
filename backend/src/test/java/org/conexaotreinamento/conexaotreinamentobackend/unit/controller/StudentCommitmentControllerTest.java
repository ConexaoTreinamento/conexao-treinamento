package org.conexaotreinamento.conexaotreinamentobackend.unit.controller;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.controller.StudentCommitmentController;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.CommitmentDetailResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentCommitment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.StudentCommitmentMapper;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentCommitmentService;
import static org.hamcrest.Matchers.hasSize;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class StudentCommitmentControllerTest {

    @Mock
    private StudentCommitmentService studentCommitmentService;

    @Mock
    private StudentCommitmentMapper commitmentMapper;

    @Mock
    private org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerScheduleRepository trainerScheduleRepository;

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

        CommitmentDetailResponseDTO dto = new CommitmentDetailResponseDTO(
                saved.getId(), studentId, "Alice", seriesId, "Yoga Basics",
                CommitmentStatus.ATTENDING, saved.getEffectiveFromTimestamp(), saved.getCreatedAt()
        );
        when(commitmentMapper.toDetailResponse(saved)).thenReturn(dto);

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

        // Act + Assert - GlobalExceptionHandler should catch and return 500
        mockMvc.perform(post("/commitments/students/{studentId}/sessions/{sessionSeriesId}", studentId, seriesId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.path").exists());
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
        
        CommitmentDetailResponseDTO dto1 = new CommitmentDetailResponseDTO(
                c1.getId(), studentId, "Bob", seriesId, "Power Yoga",
                CommitmentStatus.ATTENDING, c1.getEffectiveFromTimestamp(), c1.getCreatedAt()
        );
        when(commitmentMapper.toDetailResponse(c1)).thenReturn(dto1);

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
        
        CommitmentDetailResponseDTO dto1 = new CommitmentDetailResponseDTO(
                c1.getId(), studentId, "Carol", seriesId, "Pilates",
                CommitmentStatus.NOT_ATTENDING, c1.getEffectiveFromTimestamp(), c1.getCreatedAt()
        );
        when(commitmentMapper.toDetailResponse(c1)).thenReturn(dto1);

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
        
        CommitmentDetailResponseDTO dto1 = new CommitmentDetailResponseDTO(
                c1.getId(), studentId, "Dave", seriesId, "Evening Flow",
                CommitmentStatus.ATTENDING, c1.getEffectiveFromTimestamp(), c1.getCreatedAt()
        );
        when(commitmentMapper.toDetailResponse(c1)).thenReturn(dto1);

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
        
        CommitmentDetailResponseDTO dto1 = new CommitmentDetailResponseDTO(
                c1.getId(), studentId, "Eve", seriesId, "Morning Strength",
                CommitmentStatus.TENTATIVE, c1.getEffectiveFromTimestamp(), c1.getCreatedAt()
        );
        when(commitmentMapper.toDetailResponse(c1)).thenReturn(dto1);

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
        
        CommitmentDetailResponseDTO dto1 = new CommitmentDetailResponseDTO(
                c1.getId(), studentId, "Frank", seriesId, "Series X",
                CommitmentStatus.ATTENDING, c1.getEffectiveFromTimestamp(), c1.getCreatedAt()
        );
        CommitmentDetailResponseDTO dto2 = new CommitmentDetailResponseDTO(
                c2.getId(), studentId, "Frank", seriesId, "Series X",
                CommitmentStatus.ATTENDING, c2.getEffectiveFromTimestamp(), c2.getCreatedAt()
        );
        when(commitmentMapper.toDetailResponse(c1)).thenReturn(dto1);
        when(commitmentMapper.toDetailResponse(c2)).thenReturn(dto2);

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

        // Act + Assert - GlobalExceptionHandler should catch and return 500
        mockMvc.perform(post("/commitments/students/{studentId}/bulk", studentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.path").exists());
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

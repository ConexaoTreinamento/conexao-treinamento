package org.conexaotreinamento.conexaotreinamentobackend.unit.controller;

import org.conexaotreinamento.conexaotreinamentobackend.controller.PhysicalEvaluationController;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PhysicalEvaluationRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.PhysicalEvaluationResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.PhysicalEvaluationService;
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
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PhysicalEvaluationControllerTest {

    @Mock
    private PhysicalEvaluationService evaluationService;

    @InjectMocks
    private PhysicalEvaluationController evaluationController;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(evaluationController).build();
    }

    @Test
    void createEvaluation_returnsCreated() throws Exception {
        UUID studentId = UUID.randomUUID();
        String body = "{ \"weight\": 70.0, \"height\": 1.75 }";
        PhysicalEvaluationResponseDTO response = new PhysicalEvaluationResponseDTO(UUID.randomUUID(), studentId, LocalDate.now(), 70.0, 1.75, 22.86, null, null, null, Instant.now(), Instant.now());
        
        when(evaluationService.create(eq(studentId), any(PhysicalEvaluationRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/students/{studentId}/evaluations", studentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.weight").value(70.0));
    }

    @Test
    void getEvaluation_returnsOk() throws Exception {
        UUID studentId = UUID.randomUUID();
        UUID evaluationId = UUID.randomUUID();
        PhysicalEvaluationResponseDTO response = new PhysicalEvaluationResponseDTO(evaluationId, studentId, LocalDate.now(), 70.0, 1.75, 22.86, null, null, null, Instant.now(), Instant.now());
        
        when(evaluationService.findById(studentId, evaluationId)).thenReturn(response);

        mockMvc.perform(get("/students/{studentId}/evaluations/{evaluationId}", studentId, evaluationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(evaluationId.toString()));
    }

    @Test
    void getAllEvaluations_returnsOk() throws Exception {
        UUID studentId = UUID.randomUUID();
        PhysicalEvaluationResponseDTO response = new PhysicalEvaluationResponseDTO(UUID.randomUUID(), studentId, LocalDate.now(), 70.0, 1.75, 22.86, null, null, null, Instant.now(), Instant.now());
        
        when(evaluationService.findAllByStudentId(studentId)).thenReturn(List.of(response));

        mockMvc.perform(get("/students/{studentId}/evaluations", studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].weight").value(70.0));
    }

    @Test
    void updateEvaluation_returnsOk() throws Exception {
        UUID studentId = UUID.randomUUID();
        UUID evaluationId = UUID.randomUUID();
        String body = "{ \"weight\": 72.0, \"height\": 1.75 }";
        PhysicalEvaluationResponseDTO response = new PhysicalEvaluationResponseDTO(evaluationId, studentId, LocalDate.now(), 72.0, 1.75, 23.51, null, null, null, Instant.now(), Instant.now());
        
        when(evaluationService.update(eq(studentId), eq(evaluationId), any(PhysicalEvaluationRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/students/{studentId}/evaluations/{evaluationId}", studentId, evaluationId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weight").value(72.0));
    }

    @Test
    void deleteEvaluation_returnsNoContent() throws Exception {
        UUID studentId = UUID.randomUUID();
        UUID evaluationId = UUID.randomUUID();
        
        doNothing().when(evaluationService).delete(studentId, evaluationId);

        mockMvc.perform(delete("/students/{studentId}/evaluations/{evaluationId}", studentId, evaluationId))
                .andExpect(status().isNoContent());
        
        verify(evaluationService).delete(studentId, evaluationId);
    }
}

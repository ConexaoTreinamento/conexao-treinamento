package org.conexaotreinamento.conexaotreinamentobackend.unit.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.conexaotreinamento.conexaotreinamentobackend.controller.ExerciseController;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ExerciseResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.ExerciseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ExerciseControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ExerciseService exerciseService;

    @InjectMocks
    private ExerciseController exerciseController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper);

        mockMvc = MockMvcBuilders.standaloneSetup(exerciseController)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .setMessageConverters(converter)
                .build();
    }

    @Test
    void createExercise_ShouldReturnCreated() throws Exception {
        ExerciseRequestDTO request = new ExerciseRequestDTO("Push-up", "Chest exercise");
        ExerciseResponseDTO response = new ExerciseResponseDTO(
                UUID.randomUUID(),
                "Push-up",
                "Chest exercise",
                Instant.now(),
                Instant.now(),
                null
        );

        when(exerciseService.create(any(ExerciseRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Push-up"));
    }

    @Test
    void findExerciseById_ShouldReturnOk() throws Exception {
        UUID id = UUID.randomUUID();
        ExerciseResponseDTO response = new ExerciseResponseDTO(
                id,
                "Push-up",
                "Chest exercise",
                Instant.now(),
                Instant.now(),
                null
        );

        when(exerciseService.findById(id)).thenReturn(response);

        mockMvc.perform(get("/exercises/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void findAllExercises_ShouldReturnPage() throws Exception {
        ExerciseResponseDTO response = new ExerciseResponseDTO(
                UUID.randomUUID(),
                "Push-up",
                "Chest exercise",
                Instant.now(),
                Instant.now(),
                null
        );
        Page<ExerciseResponseDTO> page = new PageImpl<>(List.of(response), PageRequest.of(0, 10), 1);

        when(exerciseService.findAll(any(), any(Pageable.class), anyBoolean())).thenReturn(page);

        mockMvc.perform(get("/exercises"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Push-up"));
    }

    @Test
    void updateExercise_ShouldReturnOk() throws Exception {
        UUID id = UUID.randomUUID();
        ExerciseRequestDTO request = new ExerciseRequestDTO("Updated Push-up", "Updated description");
        ExerciseResponseDTO response = new ExerciseResponseDTO(
                id,
                "Updated Push-up",
                "Updated description",
                Instant.now(),
                Instant.now(),
                null
        );

        when(exerciseService.update(eq(id), any(ExerciseRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/exercises/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Push-up"));
    }

    @Test
    void patchExercise_ShouldReturnOk() throws Exception {
        UUID id = UUID.randomUUID();
        PatchExerciseRequestDTO request = new PatchExerciseRequestDTO("Patched Push-up", null);
        ExerciseResponseDTO response = new ExerciseResponseDTO(
                id,
                "Patched Push-up",
                "Chest exercise",
                Instant.now(),
                Instant.now(),
                null
        );

        when(exerciseService.patch(eq(id), any(PatchExerciseRequestDTO.class))).thenReturn(response);

        mockMvc.perform(patch("/exercises/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Patched Push-up"));
    }

    @Test
    void deleteExercise_ShouldReturnNoContent() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(exerciseService).delete(id);

        mockMvc.perform(delete("/exercises/{id}", id))
                .andExpect(status().isNoContent());
    }

    @Test
    void restoreExercise_ShouldReturnOk() throws Exception {
        UUID id = UUID.randomUUID();
        ExerciseResponseDTO response = new ExerciseResponseDTO(
                id,
                "Push-up",
                "Chest exercise",
                Instant.now(),
                Instant.now(),
                null
        );

        when(exerciseService.restore(id)).thenReturn(response);

        mockMvc.perform(patch("/exercises/{id}/restore", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }
}

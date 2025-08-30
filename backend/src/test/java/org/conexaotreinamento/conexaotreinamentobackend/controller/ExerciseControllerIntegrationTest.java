package org.conexaotreinamento.conexaotreinamentobackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Exercise;
import org.conexaotreinamento.conexaotreinamentobackend.repository.ExerciseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.conexaotreinamento.conexaotreinamentobackend.config.TestContainerConfig;
import org.springframework.context.annotation.Import;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Import(TestContainerConfig.class)
@DisplayName("ExerciseController Integration Tests")
class ExerciseControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @BeforeEach
    void setUp() {
        exerciseRepository.deleteAll();
    }

    @Test
    @DisplayName("Should create exercise successfully")
    void shouldCreateExerciseSuccessfully() throws Exception {
        // Given
        ExerciseRequestDTO request = new ExerciseRequestDTO("Flexão de Braço", "Exercício para peitoral");

        // When & Then
        mockMvc.perform(post("/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Flexão de Braço"))
                .andExpect(jsonPath("$.description").value("Exercício para peitoral"))
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.updatedAt").exists())
                .andExpect(jsonPath("$.deletedAt").doesNotExist());

        // Verify in database
        assertThat(exerciseRepository.count()).isEqualTo(1);
        Exercise savedExercise = exerciseRepository.findAll().get(0);
        assertThat(savedExercise.getName()).isEqualTo("Flexão de Braço");
        assertThat(savedExercise.getDeletedAt()).isNull();
    }

    @Test
    @DisplayName("Should return conflict when creating exercise with duplicate name")
    void shouldReturnConflictWhenCreatingExerciseWithDuplicateName() throws Exception {
        // Given
        Exercise existingExercise = new Exercise("Flexão de Braço", "Exercício existente");
        exerciseRepository.save(existingExercise);

        ExerciseRequestDTO request = new ExerciseRequestDTO("Flexão de Braço", "Tentativa de duplicar");

        // When & Then
        mockMvc.perform(post("/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Exercise already exists"));

        // Verify only one exercise in database
        assertThat(exerciseRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should return bad request when creating exercise without name")
    void shouldReturnBadRequestWhenCreatingExerciseWithoutName() throws Exception {
        // Given
        ExerciseRequestDTO request = new ExerciseRequestDTO(null, "Descrição sem nome");

        // When & Then
        mockMvc.perform(post("/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").exists());
    }

    @Test
    @DisplayName("Should find exercise by id successfully")
    void shouldFindExerciseByIdSuccessfully() throws Exception {
        // Given
        Exercise exercise = new Exercise("Agachamento", "Exercício para pernas");
        Exercise savedExercise = exerciseRepository.save(exercise);

        // When & Then
        mockMvc.perform(get("/exercises/{id}", savedExercise.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedExercise.getId().toString()))
                .andExpect(jsonPath("$.name").value("Agachamento"))
                .andExpect(jsonPath("$.description").value("Exercício para pernas"));
    }

    @Test
    @DisplayName("Should return not found when exercise does not exist")
    void shouldReturnNotFoundWhenExerciseDoesNotExist() throws Exception {
        // Given
        UUID nonExistentId = UUID.randomUUID();

        // When & Then
        mockMvc.perform(get("/exercises/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Exercise not found"));
    }

    @Test
    @DisplayName("Should find all exercises with pagination")
    void shouldFindAllExercisesWithPagination() throws Exception {
        // Given
        Exercise exercise1 = new Exercise("Flexão", "Exercício 1");
        Exercise exercise2 = new Exercise("Agachamento", "Exercício 2");
        exerciseRepository.save(exercise1);
        exerciseRepository.save(exercise2);

        // When & Then
        mockMvc.perform(get("/exercises")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.pageable.pageNumber").value(0))
                .andExpect(jsonPath("$.pageable.pageSize").value(10));
    }

    @Test
    @DisplayName("Should search exercises by name")
    void shouldSearchExercisesByName() throws Exception {
        // Given
        Exercise exercise1 = new Exercise("Flexão de Braço", "Para peitoral");
        Exercise exercise2 = new Exercise("Agachamento", "Para pernas");
        exerciseRepository.save(exercise1);
        exerciseRepository.save(exercise2);

        // When & Then
        mockMvc.perform(get("/exercises")
                        .param("search", "flexão"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name").value("Flexão de Braço"));
    }

    @Test
    @DisplayName("Should update exercise successfully")
    void shouldUpdateExerciseSuccessfully() throws Exception {
        // Given
        Exercise exercise = new Exercise("Flexão", "Descrição antiga");
        Exercise savedExercise = exerciseRepository.save(exercise);

        ExerciseRequestDTO updateRequest = new ExerciseRequestDTO("Flexão Modificada", "Nova descrição");

        // When & Then
        mockMvc.perform(put("/exercises/{id}", savedExercise.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedExercise.getId().toString()))
                .andExpect(jsonPath("$.name").value("Flexão Modificada"))
                .andExpect(jsonPath("$.description").value("Nova descrição"));

        // Verify in database
        Exercise updatedExercise = exerciseRepository.findById(savedExercise.getId()).orElseThrow();
        assertThat(updatedExercise.getName()).isEqualTo("Flexão Modificada");
        assertThat(updatedExercise.getDescription()).isEqualTo("Nova descrição");
    }

    @Test
    @DisplayName("Should patch exercise successfully")
    void shouldPatchExerciseSuccessfully() throws Exception {
        // Given
        Exercise exercise = new Exercise("Flexão", "Descrição original");
        Exercise savedExercise = exerciseRepository.save(exercise);

        PatchExerciseRequestDTO patchRequest = new PatchExerciseRequestDTO(null, "Descrição atualizada");

        // When & Then
        mockMvc.perform(patch("/exercises/{id}", savedExercise.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patchRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedExercise.getId().toString()))
                .andExpect(jsonPath("$.name").value("Flexão")) // Nome não mudou
                .andExpect(jsonPath("$.description").value("Descrição atualizada"));
    }

    @Test
    @DisplayName("Should delete exercise successfully (soft delete)")
    void shouldDeleteExerciseSuccessfully() throws Exception {
        // Given
        Exercise exercise = new Exercise("Flexão", "Para deletar");
        Exercise savedExercise = exerciseRepository.save(exercise);

        // When & Then
        mockMvc.perform(delete("/exercises/{id}", savedExercise.getId()))
                .andExpect(status().isNoContent());

        // Verify soft delete
        Exercise deletedExercise = exerciseRepository.findById(savedExercise.getId()).orElseThrow();
        assertThat(deletedExercise.getDeletedAt()).isNotNull();

        // Verify exercise is not found in active searches
        mockMvc.perform(get("/exercises/{id}", savedExercise.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should allow creating exercise with same name as deleted one")
    void shouldAllowCreatingExerciseWithSameNameAsDeletedOne() throws Exception {
        // Given - Create and soft delete an exercise
        Exercise exercise = new Exercise("Flexão", "Exercício deletado");
        exercise.setDeletedAt(Instant.now());
        exerciseRepository.save(exercise);

        ExerciseRequestDTO request = new ExerciseRequestDTO("Flexão", "Novo exercício com mesmo nome");

        // When & Then
        mockMvc.perform(post("/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Flexão"))
                .andExpect(jsonPath("$.description").value("Novo exercício com mesmo nome"));

        // Verify we have 2 exercises: 1 deleted, 1 active
        assertThat(exerciseRepository.count()).isEqualTo(2);
        assertThat(exerciseRepository.findByDeletedAtIsNull(PageRequest.of(0, 10)).getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should return empty result for non-existent search")
    void shouldReturnEmptyResultForNonExistentSearch() throws Exception {
        // Given
        Exercise exercise = new Exercise("Flexão", "Exercício teste");
        exerciseRepository.save(exercise);

        // When & Then
        mockMvc.perform(get("/exercises")
                        .param("search", "exercicio_inexistente"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @DisplayName("Should handle invalid UUID format")
    void shouldHandleInvalidUuidFormat() throws Exception {
        // When & Then
        mockMvc.perform(get("/exercises/invalid-uuid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should apply default sorting when not specified")
    void shouldApplyDefaultSortingWhenNotSpecified() throws Exception {
        // Given - Create exercises with different creation times
        Exercise oldExercise = new Exercise("Exercício Antigo", "Primeiro");
        exerciseRepository.save(oldExercise);
        
        Thread.sleep(10); // Ensure different timestamps
        
        Exercise newExercise = new Exercise("Exercício Novo", "Segundo");
        exerciseRepository.save(newExercise);

        // When & Then - Should return newest first (default sort by createdAt DESC)
        mockMvc.perform(get("/exercises"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Exercício Novo"))
                .andExpect(jsonPath("$.content[1].name").value("Exercício Antigo"));
    }
}

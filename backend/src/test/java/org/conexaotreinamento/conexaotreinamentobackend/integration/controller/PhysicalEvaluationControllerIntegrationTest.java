package org.conexaotreinamento.conexaotreinamentobackend.integration.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.conexaotreinamento.conexaotreinamentobackend.config.TestContainerConfig;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PhysicalEvaluationRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalEvaluation;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.repository.PhysicalEvaluationRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
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
@DisplayName("PhysicalEvaluationController Integration Tests")
class PhysicalEvaluationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PhysicalEvaluationRepository evaluationRepository;

    @Autowired
    private StudentRepository studentRepository;

    private Student testStudent;

    @BeforeEach
    void setUp() {
        evaluationRepository.deleteAll();
        studentRepository.deleteAll();

        // Create a test student
        testStudent = new Student(
                "test@example.com",
                "João",
                "Silva",
                Student.Gender.M,
                LocalDate.of(1990, 1, 1)
        );
        testStudent.setRegistrationDate(LocalDate.now());
        testStudent = studentRepository.save(testStudent);
    }

    @Test
    @DisplayName("Should create physical evaluation successfully")
    void shouldCreatePhysicalEvaluationSuccessfully() throws Exception {
        // Given
        PhysicalEvaluationRequestDTO request = new PhysicalEvaluationRequestDTO(
                68.5,
                165.0,
                null,
                null,
                null
        );

        // When & Then
        mockMvc.perform(post("/students/{studentId}/evaluations", testStudent.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.studentId").value(testStudent.getId().toString()))
                .andExpect(jsonPath("$.weight").value(68.5))
                .andExpect(jsonPath("$.height").value(165.0))
                .andExpect(jsonPath("$.bmi").value(25.2))
                .andExpect(jsonPath("$.date").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.updatedAt").exists());

        // Verify in database
        assertThat(evaluationRepository.count()).isEqualTo(1);
        PhysicalEvaluation savedEvaluation = evaluationRepository.findAll().get(0);
        assertThat(savedEvaluation.getWeight()).isEqualTo(68.5);
        assertThat(savedEvaluation.getHeight()).isEqualTo(165.0);
        assertThat(savedEvaluation.getBmi()).isEqualTo(25.2);
        assertThat(savedEvaluation.getDate()).isEqualTo(LocalDate.now());
        assertThat(savedEvaluation.getDeletedAt()).isNull();
    }

    @Test
    @DisplayName("Should create evaluation with all measurements")
    void shouldCreateEvaluationWithAllMeasurements() throws Exception {
        // Given
        PhysicalEvaluationRequestDTO.CircumferencesDTO circumferences = 
                new PhysicalEvaluationRequestDTO.CircumferencesDTO(
                        28.0, 27.0, 32.0, 31.0, 80.0, 90.0, 100.0, 55.0, 54.0, 35.0, 34.0
                );

        PhysicalEvaluationRequestDTO.SubcutaneousFoldsDTO folds = 
                new PhysicalEvaluationRequestDTO.SubcutaneousFoldsDTO(
                        12.0, 10.0, 14.0, 16.0, 18.0, 20.0, 22.0
                );

        PhysicalEvaluationRequestDTO.DiametersDTO diameters = 
                new PhysicalEvaluationRequestDTO.DiametersDTO(12.0, 14.0);

        PhysicalEvaluationRequestDTO request = new PhysicalEvaluationRequestDTO(
                68.5,
                165.0,
                circumferences,
                folds,
                diameters
        );

        // When & Then
        mockMvc.perform(post("/students/{studentId}/evaluations", testStudent.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.circumferences.rightArmRelaxed").value(28.0))
                .andExpect(jsonPath("$.circumferences.waist").value(80.0))
                .andExpect(jsonPath("$.subcutaneousFolds.triceps").value(12.0))
                .andExpect(jsonPath("$.diameters.umerus").value(12.0));

        // Verify in database
        PhysicalEvaluation saved = evaluationRepository.findAll().get(0);
        assertThat(saved.getCircumferences()).isNotNull();
        assertThat(saved.getCircumferences().getRightArmRelaxed()).isEqualTo(28.0);
        assertThat(saved.getSubcutaneousFolds()).isNotNull();
        assertThat(saved.getSubcutaneousFolds().getTriceps()).isEqualTo(12.0);
        assertThat(saved.getDiameters()).isNotNull();
        assertThat(saved.getDiameters().getUmerus()).isEqualTo(12.0);
    }

    @Test
    @DisplayName("Should return 404 when creating evaluation for non-existent student")
    void shouldReturn404WhenCreatingEvaluationForNonExistentStudent() throws Exception {
        // Given
        UUID nonExistentStudentId = UUID.randomUUID();
        PhysicalEvaluationRequestDTO request = new PhysicalEvaluationRequestDTO(
                68.5,
                165.0,
                null,
                null,
                null
        );

        // When & Then
        mockMvc.perform(post("/students/{studentId}/evaluations", nonExistentStudentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").exists());

        // Verify nothing was created
        assertThat(evaluationRepository.count()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should return 400 when creating evaluation with invalid data")
    void shouldReturn400WhenCreatingEvaluationWithInvalidData() throws Exception {
        // Given - negative weight
        PhysicalEvaluationRequestDTO request = new PhysicalEvaluationRequestDTO(
                -10.0,
                165.0,
                null,
                null,
                null
        );

        // When & Then
        mockMvc.perform(post("/students/{studentId}/evaluations", testStudent.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").exists());
    }

    @Test
    @DisplayName("Should get evaluation by ID successfully")
    void shouldGetEvaluationByIdSuccessfully() throws Exception {
        // Given
        PhysicalEvaluation evaluation = new PhysicalEvaluation(
                testStudent,
                LocalDate.now(),
                70.0,
                175.0,
                22.9
        );
        PhysicalEvaluation savedEvaluation = evaluationRepository.save(evaluation);

        // When & Then
        mockMvc.perform(get("/students/{studentId}/evaluations/{evaluationId}", 
                        testStudent.getId(), savedEvaluation.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedEvaluation.getId().toString()))
                .andExpect(jsonPath("$.studentId").value(testStudent.getId().toString()))
                .andExpect(jsonPath("$.weight").value(70.0))
                .andExpect(jsonPath("$.height").value(175.0))
                .andExpect(jsonPath("$.bmi").value(22.9));
    }

    @Test
    @DisplayName("Should return 404 when evaluation does not exist")
    void shouldReturn404WhenEvaluationDoesNotExist() throws Exception {
        // Given
        UUID nonExistentId = UUID.randomUUID();

        // When & Then
        mockMvc.perform(get("/students/{studentId}/evaluations/{evaluationId}", 
                        testStudent.getId(), nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("Should get all evaluations for student ordered by date desc")
    void shouldGetAllEvaluationsForStudentOrderedByDateDesc() throws Exception {
        // Given - Create evaluations with different dates
        PhysicalEvaluation evaluation1 = new PhysicalEvaluation(
                testStudent,
                LocalDate.now().minusDays(2),
                70.0,
                175.0,
                22.9
        );
        evaluationRepository.save(evaluation1);

        PhysicalEvaluation evaluation2 = new PhysicalEvaluation(
                testStudent,
                LocalDate.now(),
                68.5,
                175.0,
                22.4
        );
        evaluationRepository.save(evaluation2);

        PhysicalEvaluation evaluation3 = new PhysicalEvaluation(
                testStudent,
                LocalDate.now().minusDays(5),
                72.0,
                175.0,
                23.5
        );
        evaluationRepository.save(evaluation3);

        // When & Then
        mockMvc.perform(get("/students/{studentId}/evaluations", testStudent.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].weight").value(68.5)) // Most recent first
                .andExpect(jsonPath("$[1].weight").value(70.0))
                .andExpect(jsonPath("$[2].weight").value(72.0)); // Oldest last
    }

    @Test
    @DisplayName("Should return empty list when student has no evaluations")
    void shouldReturnEmptyListWhenStudentHasNoEvaluations() throws Exception {
        // When & Then
        mockMvc.perform(get("/students/{studentId}/evaluations", testStudent.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("Should update evaluation successfully")
    void shouldUpdateEvaluationSuccessfully() throws Exception {
        // Given
        PhysicalEvaluation evaluation = new PhysicalEvaluation(
                testStudent,
                LocalDate.now(),
                70.0,
                175.0,
                22.9
        );
        PhysicalEvaluation savedEvaluation = evaluationRepository.save(evaluation);

        PhysicalEvaluationRequestDTO updateRequest = new PhysicalEvaluationRequestDTO(
                75.0,
                175.0,
                null,
                null,
                null
        );

        // When & Then
        mockMvc.perform(put("/students/{studentId}/evaluations/{evaluationId}", 
                        testStudent.getId(), savedEvaluation.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedEvaluation.getId().toString()))
                .andExpect(jsonPath("$.weight").value(75.0))
                .andExpect(jsonPath("$.bmi").value(24.5)); // Recalculated BMI

        // Verify in database
        PhysicalEvaluation updated = evaluationRepository.findById(savedEvaluation.getId()).orElseThrow();
        assertThat(updated.getWeight()).isEqualTo(75.0);
        assertThat(updated.getBmi()).isEqualTo(24.5);
        assertThat(updated.getDate()).isEqualTo(LocalDate.now()); // Date should not change
    }

    @Test
    @DisplayName("Should update evaluation with measurements")
    void shouldUpdateEvaluationWithMeasurements() throws Exception {
        // Given
        PhysicalEvaluation evaluation = new PhysicalEvaluation(
                testStudent,
                LocalDate.now(),
                70.0,
                175.0,
                22.9
        );
        PhysicalEvaluation savedEvaluation = evaluationRepository.save(evaluation);

        PhysicalEvaluationRequestDTO.CircumferencesDTO circumferences = 
                new PhysicalEvaluationRequestDTO.CircumferencesDTO(
                        30.0, 29.0, 34.0, 33.0, 85.0, 95.0, 105.0, 60.0, 59.0, 40.0, 39.0
                );

        PhysicalEvaluationRequestDTO updateRequest = new PhysicalEvaluationRequestDTO(
                72.0,
                175.0,
                circumferences,
                null,
                null
        );

        // When & Then
        mockMvc.perform(put("/students/{studentId}/evaluations/{evaluationId}", 
                        testStudent.getId(), savedEvaluation.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.circumferences.rightArmRelaxed").value(30.0))
                .andExpect(jsonPath("$.circumferences.waist").value(85.0));

        // Verify in database
        PhysicalEvaluation updated = evaluationRepository.findById(savedEvaluation.getId()).orElseThrow();
        assertThat(updated.getCircumferences()).isNotNull();
        assertThat(updated.getCircumferences().getRightArmRelaxed()).isEqualTo(30.0);
    }

    @Test
    @DisplayName("Should delete evaluation successfully (soft delete)")
    void shouldDeleteEvaluationSuccessfully() throws Exception {
        // Given
        PhysicalEvaluation evaluation = new PhysicalEvaluation(
                testStudent,
                LocalDate.now(),
                70.0,
                175.0,
                22.9
        );
        PhysicalEvaluation savedEvaluation = evaluationRepository.save(evaluation);

        // When & Then
        mockMvc.perform(delete("/students/{studentId}/evaluations/{evaluationId}", 
                        testStudent.getId(), savedEvaluation.getId()))
                .andExpect(status().isNoContent());

        // Verify soft delete
        PhysicalEvaluation deleted = evaluationRepository.findById(savedEvaluation.getId()).orElseThrow();
        assertThat(deleted.getDeletedAt()).isNotNull();

        // Verify evaluation is not found in active searches
        mockMvc.perform(get("/students/{studentId}/evaluations/{evaluationId}", 
                        testStudent.getId(), savedEvaluation.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return 404 when deleting evaluation for another student")
    void shouldReturnNotFoundWhenDeletingEvaluationForAnotherStudent() throws Exception {
        // Given
        PhysicalEvaluation evaluation = new PhysicalEvaluation(
                testStudent,
                LocalDate.now(),
                70.0,
                175.0,
                22.9
        );
        PhysicalEvaluation savedEvaluation = evaluationRepository.save(evaluation);

        Student otherStudent = new Student(
                "other@example.com",
                "Maria",
                "Oliveira",
                Student.Gender.F,
                LocalDate.of(1995, 5, 5)
        );
        otherStudent.setRegistrationDate(LocalDate.now());
        otherStudent = studentRepository.save(otherStudent);

        // When & Then
        mockMvc.perform(delete("/students/{studentId}/evaluations/{evaluationId}",
                        otherStudent.getId(), savedEvaluation.getId()))
                .andExpect(status().isNotFound());

        // Verify evaluation remains active
        PhysicalEvaluation persistedEvaluation = evaluationRepository.findById(savedEvaluation.getId()).orElseThrow();
        assertThat(persistedEvaluation.getDeletedAt()).isNull();
    }

    @Test
    @DisplayName("Should not include deleted evaluations in list")
    void shouldNotIncludeDeletedEvaluationsInList() throws Exception {
        // Given
        PhysicalEvaluation activeEvaluation = new PhysicalEvaluation(
                testStudent,
                LocalDate.now(),
                70.0,
                175.0,
                22.9
        );
        evaluationRepository.save(activeEvaluation);

        PhysicalEvaluation deletedEvaluation = new PhysicalEvaluation(
                testStudent,
                LocalDate.now().minusDays(1),
                68.0,
                175.0,
                22.2
        );
        deletedEvaluation.deactivate();
        evaluationRepository.save(deletedEvaluation);

        // When & Then
        mockMvc.perform(get("/students/{studentId}/evaluations", testStudent.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].weight").value(70.0));
    }

    @Test
    @DisplayName("Should calculate BMI correctly on creation")
    void shouldCalculateBMICorrectlyOnCreation() throws Exception {
        // Given - BMI = 68.5 / (1.65)^2 = 25.2
        PhysicalEvaluationRequestDTO request = new PhysicalEvaluationRequestDTO(
                68.5,
                165.0,
                null,
                null,
                null
        );

        // When & Then
        mockMvc.perform(post("/students/{studentId}/evaluations", testStudent.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bmi").value(25.2));
    }

    @Test
    @DisplayName("Should recalculate BMI on update")
    void shouldRecalculateBMIOnUpdate() throws Exception {
        // Given
        PhysicalEvaluation evaluation = new PhysicalEvaluation(
                testStudent,
                LocalDate.now(),
                70.0,
                175.0,
                22.9
        );
        PhysicalEvaluation savedEvaluation = evaluationRepository.save(evaluation);

        // Update weight - BMI should change from 22.9 to 24.5
        PhysicalEvaluationRequestDTO updateRequest = new PhysicalEvaluationRequestDTO(
                75.0,
                175.0,
                null,
                null,
                null
        );

        // When & Then
        mockMvc.perform(put("/students/{studentId}/evaluations/{evaluationId}", 
                        testStudent.getId(), savedEvaluation.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bmi").value(24.5));
    }

    @Test
    @DisplayName("Should return 404 when updating non-existent evaluation")
    void shouldReturn404WhenUpdatingNonExistentEvaluation() throws Exception {
        // Given
        UUID nonExistentId = UUID.randomUUID();
        PhysicalEvaluationRequestDTO request = new PhysicalEvaluationRequestDTO(
                70.0,
                175.0,
                null,
                null,
                null
        );

        // When & Then
        mockMvc.perform(put("/students/{studentId}/evaluations/{evaluationId}", 
                        testStudent.getId(), nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("Should return 404 when deleting non-existent evaluation")
    void shouldReturn404WhenDeletingNonExistentEvaluation() throws Exception {
        // Given
        UUID nonExistentId = UUID.randomUUID();

        // When & Then
        mockMvc.perform(delete("/students/{studentId}/evaluations/{evaluationId}", 
                        testStudent.getId(), nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("Should handle multiple evaluations for same student")
    void shouldHandleMultipleEvaluationsForSameStudent() throws Exception {
        // Given - Create 3 evaluations
        for (int i = 0; i < 3; i++) {
            PhysicalEvaluationRequestDTO request = new PhysicalEvaluationRequestDTO(
                    70.0 + i,
                    175.0,
                    null,
                    null,
                    null
            );

            mockMvc.perform(post("/students/{studentId}/evaluations", testStudent.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());

            // Small delay to ensure different timestamps
            Thread.sleep(10);
        }

        // When & Then
        mockMvc.perform(get("/students/{studentId}/evaluations", testStudent.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));

        // Verify in database
        List<PhysicalEvaluation> evaluations = evaluationRepository.findByStudentIdAndDeletedAtIsNullOrderByDateDesc(testStudent.getId());
        assertThat(evaluations).hasSize(3);
    }

    @Test
    @DisplayName("Should validate required fields")
    void shouldValidateRequiredFields() throws Exception {
        // Given - missing weight
        String invalidRequest = "{\"height\": 175.0}";

        // When & Then
        mockMvc.perform(post("/students/{studentId}/evaluations", testStudent.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequest))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should handle student with no evaluations gracefully")
    void shouldHandleStudentWithNoEvaluationsGracefully() throws Exception {
        // When & Then
        mockMvc.perform(get("/students/{studentId}/evaluations", testStudent.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)))
                .andExpect(jsonPath("$").isArray());
    }
}


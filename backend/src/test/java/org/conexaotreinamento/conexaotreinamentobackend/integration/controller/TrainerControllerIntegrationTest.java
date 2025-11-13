package org.conexaotreinamento.conexaotreinamentobackend.integration.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.conexaotreinamento.conexaotreinamentobackend.config.TestContainerConfig;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
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
@DisplayName("TrainerController Integration Tests")
class TrainerControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private UserRepository userRepository;

    private UUID authenticatedUserId;
    private User testUser;

    @BeforeEach
    void setUp() {
        trainerRepository.deleteAll();
        userRepository.deleteAll();
        
        // Create test user for authentication
        testUser = new User("trainer@test.com", "password", Role.ROLE_TRAINER);
        testUser = userRepository.save(testUser);
        
        authenticatedUserId = testUser.getId();
        
        // Set up security context
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            testUser.getEmail(),
            null,
            List.of(new SimpleGrantedAuthority("ROLE_TRAINER"))
        );
        authentication.setDetails(testUser.getId().toString());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }





    @Test
    @DisplayName("Should return not found when trainer does not exist")
    void shouldReturnNotFoundWhenTrainerDoesNotExist() throws Exception {
        // Given
        UUID nonExistentId = UUID.randomUUID();

        // When & Then
        mockMvc.perform(get("/trainers/{id}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Trainer not found"));
    }



    @Test
    @DisplayName("Should return empty list when no trainers exist")
    void shouldReturnEmptyListWhenNoTrainersExist() throws Exception {
        // When & Then
        mockMvc.perform(get("/trainers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("Should return not found when updating non-existent trainer")
    void shouldReturnNotFoundWhenUpdatingNonExistentTrainer() throws Exception {
        // Given
        UUID nonExistentId = UUID.randomUUID();
        TrainerCreateRequestDTO updateRequest = new TrainerCreateRequestDTO(
            "Updated Name",
            "updated@test.com",
            "+5511999999999",
            "password123",
            "Rua Teste, 456",
            LocalDate.of(1990, 3, 20),
            List.of("Specialty"),
            CompensationType.HOURLY
        );

        // When & Then
        mockMvc.perform(put("/trainers/{id}", nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Trainer not found"));
    }

    @Test
    @DisplayName("Should handle invalid UUID format")
    void shouldHandleInvalidUuidFormat() throws Exception {
        // When & Then
        mockMvc.perform(get("/trainers/invalid-uuid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should create trainer with minimal required fields")
    void shouldCreateTrainerWithMinimalRequiredFields() throws Exception {
        // Given
        TrainerCreateRequestDTO request = new TrainerCreateRequestDTO(
            "Minimal Trainer",
            "minimal@test.com",
            "+5511444444444",
            "password123",
            "Rua Mínima, 789",
            LocalDate.of(1992, 8, 10),
            List.of("Basic Training"),
            CompensationType.HOURLY
        );

        // When & Then
        mockMvc.perform(post("/trainers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Minimal Trainer"))
                .andExpect(jsonPath("$.specialties", hasSize(1)))
                .andExpect(jsonPath("$.specialties[0]").value("Basic Training"));
    }

    @Test
    @DisplayName("Should create trainer with multiple specialties")
    void shouldCreateTrainerWithMultipleSpecialties() throws Exception {
        // Given
        TrainerCreateRequestDTO request = new TrainerCreateRequestDTO(
            "Multi Specialist",
            "multi@test.com",
            "+5511333333333",
            "password123",
            "Rua Multi, 321",
            LocalDate.of(1988, 12, 25),
            List.of("Musculação", "Crossfit", "Yoga", "Pilates", "Natação"),
            CompensationType.MONTHLY
        );

        // When & Then
        mockMvc.perform(post("/trainers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.specialties", hasSize(5)))
                .andExpect(jsonPath("$.specialties", containsInAnyOrder(
                    "Musculação", "Crossfit", "Yoga", "Pilates", "Natação")));
    }


}

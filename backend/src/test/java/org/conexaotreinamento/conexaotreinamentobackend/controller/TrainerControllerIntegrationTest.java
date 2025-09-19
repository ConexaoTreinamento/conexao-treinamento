package org.conexaotreinamento.conexaotreinamentobackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.conexaotreinamento.conexaotreinamentobackend.config.TestContainerConfig;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateTrainerDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
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
    @DisplayName("Should find all trainers successfully")
    void shouldFindAllTrainersSuccessfully() throws Exception {
        // Given - Create multiple trainers
        User user1 = new User("trainer1@test.com", "password", Role.ROLE_TRAINER);
        user1 = userRepository.save(user1);

        User user2 = new User("trainer2@test.com", "password", Role.ROLE_TRAINER);
        user2 = userRepository.save(user2);

        Trainer trainer1 = new Trainer();
        trainer1.setId(user1.getId());
        trainer1.setName("Trainer One");
        trainer1.setPhone("+5511111111111");
        trainer1.setSpecialties(List.of("Musculação"));
        trainer1.setCompensationType(CompensationType.HOURLY);
        trainerRepository.save(trainer1);

        Trainer trainer2 = new Trainer();
        trainer2.setId(user2.getId());
        trainer2.setName("Trainer Two");
        trainer2.setPhone("+5511222222222");
        trainer2.setSpecialties(List.of("Yoga", "Pilates"));
        trainer2.setCompensationType(CompensationType.MONTHLY);
        trainerRepository.save(trainer2);

        // When & Then
        mockMvc.perform(get("/trainers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].name", containsInAnyOrder("Trainer One", "Trainer Two")))
                .andExpect(jsonPath("$[*].active", everyItem(is(true))));
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
    @DisplayName("Should update trainer successfully")
    void shouldUpdateTrainerSuccessfully() throws Exception {
        // Given - Create existing trainer
        Trainer existingTrainer = new Trainer();
        existingTrainer.setId(authenticatedUserId);
        existingTrainer.setName("Old Name");
        existingTrainer.setPhone("+5511000000000");
        existingTrainer.setSpecialties(List.of("Old Specialty"));
        existingTrainer.setCompensationType(CompensationType.HOURLY);
        trainerRepository.save(existingTrainer);

        CreateTrainerDTO updateRequest = new CreateTrainerDTO(
            "Updated Name",
            "updated@test.com",
            "+5511999999999",
            "newpassword123",
            "Rua Atualizada, 123",
            LocalDate.of(1985, 5, 15),
            List.of("New Specialty", "Another Specialty"),
            CompensationType.MONTHLY
        );

        // When & Then
        mockMvc.perform(put("/trainers/{id}", authenticatedUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(authenticatedUserId.toString()))
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.email").value("updated@test.com"))
                .andExpect(jsonPath("$.phone").value("+5511999999999"))
                .andExpect(jsonPath("$.specialties", hasSize(2)))
                .andExpect(jsonPath("$.specialties", containsInAnyOrder("New Specialty", "Another Specialty")))
                .andExpect(jsonPath("$.compensationType").value("MONTHLY"));

        // Verify in database
        Trainer updatedTrainer = trainerRepository.findById(authenticatedUserId).orElseThrow();
        assertThat(updatedTrainer.getName()).isEqualTo("Updated Name");
        assertThat(updatedTrainer.getCompensationType()).isEqualTo(CompensationType.MONTHLY);
    }

    @Test
    @DisplayName("Should return not found when updating non-existent trainer")
    void shouldReturnNotFoundWhenUpdatingNonExistentTrainer() throws Exception {
        // Given
        UUID nonExistentId = UUID.randomUUID();
        CreateTrainerDTO updateRequest = new CreateTrainerDTO(
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
    @DisplayName("Should delete trainer successfully")
    void shouldDeleteTrainerSuccessfully() throws Exception {
        // Given
        Trainer trainer = new Trainer();
        trainer.setId(authenticatedUserId);
        trainer.setName("To Delete");
        trainer.setPhone("+5511555555555");
        trainer.setSpecialties(List.of("Specialty"));
        trainer.setCompensationType(CompensationType.HOURLY);
        trainerRepository.save(trainer);

        // When & Then
        mockMvc.perform(delete("/trainers/{id}", authenticatedUserId))
                .andExpect(status().isNoContent());

        // Verify trainer was deleted
        assertThat(trainerRepository.findById(authenticatedUserId)).isEmpty();
    }

    @Test
    @DisplayName("Should return not found when deleting non-existent trainer")
    void shouldReturnNotFoundWhenDeletingNonExistentTrainer() throws Exception {
        // Given
        UUID nonExistentId = UUID.randomUUID();

        // When & Then
        mockMvc.perform(delete("/trainers/{id}", nonExistentId))
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
        CreateTrainerDTO request = new CreateTrainerDTO(
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
        CreateTrainerDTO request = new CreateTrainerDTO(
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

    @Test
    @DisplayName("Should handle both compensation types correctly")
    void shouldHandleBothCompensationTypesCorrectly() throws Exception {
        // Test HOURLY compensation type
        CreateTrainerDTO hourlyRequest = new CreateTrainerDTO(
            "Hourly Trainer",
            "hourly@test.com",
            "+5511111111111",
            "password123",
            "Rua Hourly, 111",
            LocalDate.of(1987, 6, 30),
            List.of("Personal Training"),
            CompensationType.HOURLY
        );

        mockMvc.perform(post("/trainers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hourlyRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.compensationType").value("HOURLY"));

        // Clean up for next test
        trainerRepository.deleteAll();
        
        // Create new user for second test
        User newUser = new User("monthly@test.com", "password", Role.ROLE_TRAINER);
        newUser = userRepository.save(newUser);
        
        // Update security context
        UsernamePasswordAuthenticationToken newAuth = new UsernamePasswordAuthenticationToken(
            newUser.getEmail(),
            null,
            List.of(new SimpleGrantedAuthority("ROLE_TRAINER"))
        );
        newAuth.setDetails(newUser.getId().toString());
        SecurityContextHolder.getContext().setAuthentication(newAuth);

        // Test MONTHLY compensation type
        CreateTrainerDTO monthlyRequest = new CreateTrainerDTO(
            "Monthly Trainer",
            "monthly@test.com",
            "+5511222222222",
            "password123",
            "Rua Monthly, 222",
            LocalDate.of(1989, 11, 15),
            List.of("Group Classes"),
            CompensationType.MONTHLY
        );

        mockMvc.perform(post("/trainers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(monthlyRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.compensationType").value("MONTHLY"));
    }
}

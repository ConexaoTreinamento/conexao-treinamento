package org.conexaotreinamento.conexaotreinamentobackend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import org.conexaotreinamento.conexaotreinamentobackend.config.TestContainerConfig;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateAdministratorDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AdministratorRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Import(TestContainerConfig.class)
@DisplayName("AdministratorController Integration Tests - New Implementation")
class AdministratorControllerIntegrationTestNew {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        administratorRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Should create administrator successfully")
    void shouldCreateAdministratorSuccessfully() throws Exception {
        // Given
        CreateAdministratorDTO request = new CreateAdministratorDTO(
                "João", 
                "Silva", 
                "joao.silva@example.com", 
                "senha123"
        );

        // When & Then
        mockMvc.perform(post("/administrators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.firstName").value("João"))
                .andExpect(jsonPath("$.lastName").value("Silva"))
                .andExpect(jsonPath("$.email").value("joao.silva@example.com"))
                .andExpect(jsonPath("$.fullName").value("João Silva"))
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.joinDate").exists());

        // Verify in database
        assertThat(administratorRepository.count()).isEqualTo(1);
        assertThat(userRepository.count()).isEqualTo(1);
        
        Administrator savedAdmin = administratorRepository.findAll().get(0);
        assertThat(savedAdmin.getFirstName()).isEqualTo("João");
        assertThat(savedAdmin.getLastName()).isEqualTo("Silva");
        
        User savedUser = userRepository.findAll().get(0);
        assertThat(savedUser.getEmail()).isEqualTo("joao.silva@example.com");
        assertThat(savedUser.getRole()).isEqualTo(Role.ROLE_ADMIN);
        assertThat(savedUser.isActive()).isTrue();
        // Verify password is encrypted
        assertThat(passwordEncoder.matches("senha123", savedUser.getPassword())).isTrue();
    }

    @Test
    @DisplayName("Should return validation errors for empty fields")
    void shouldReturnValidationErrorsForEmptyFields() throws Exception {
        // Given
        CreateAdministratorDTO request = new CreateAdministratorDTO("", "", "", "");

        // When & Then
        mockMvc.perform(post("/administrators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.firstName").value("Nome é obrigatório"))
                .andExpect(jsonPath("$.fieldErrors.lastName").value("Sobrenome é obrigatório"))
                .andExpect(jsonPath("$.fieldErrors.email").value("Email é obrigatório"))
                .andExpect(jsonPath("$.fieldErrors.password").value("Senha é obrigatória"));

        // Verify nothing was saved
        assertThat(administratorRepository.count()).isEqualTo(0);
        assertThat(userRepository.count()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should return validation error for invalid email")
    void shouldReturnValidationErrorForInvalidEmail() throws Exception {
        // Given
        CreateAdministratorDTO request = new CreateAdministratorDTO(
                "João", 
                "Silva", 
                "email-invalido", 
                "senha123"
        );

        // When & Then
        mockMvc.perform(post("/administrators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").value("Email deve ter um formato válido"));
    }

    @Test
    @DisplayName("Should return validation error for short password")
    void shouldReturnValidationErrorForShortPassword() throws Exception {
        // Given
        CreateAdministratorDTO request = new CreateAdministratorDTO(
                "João", 
                "Silva", 
                "joao@example.com", 
                "123"
        );

        // When & Then
        mockMvc.perform(post("/administrators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").value("Senha deve ter entre 6 e 255 caracteres"));
    }

    @Test
    @DisplayName("Should list administrators successfully")
    void shouldListAdministratorsSuccessfully() throws Exception {
        // Given - Create administrators using the new pattern
        User user1 = new User("admin1@example.com", passwordEncoder.encode("password"), Role.ROLE_ADMIN);
        user1 = userRepository.save(user1);
        Administrator admin1 = new Administrator();
        admin1.setUserId(user1.getId());
        admin1.setFirstName("João");
        admin1.setLastName("Silva");
        administratorRepository.save(admin1);

        User user2 = new User("admin2@example.com", passwordEncoder.encode("password"), Role.ROLE_ADMIN);
        user2 = userRepository.save(user2);
        Administrator admin2 = new Administrator();
        admin2.setUserId(user2.getId());
        admin2.setFirstName("Maria");
        admin2.setLastName("Santos");
        administratorRepository.save(admin2);

        // When & Then
        mockMvc.perform(get("/administrators"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }
}
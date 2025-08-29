package org.conexaotreinamento.conexaotreinamentobackend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AdministratorRepository;
import static org.hamcrest.Matchers.hasSize;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("AdministratorController Integration Tests")
class AdministratorControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        administratorRepository.deleteAll();
    }

    @Test
    @DisplayName("Should create administrator successfully")
    void shouldCreateAdministratorSuccessfully() throws Exception {
        // Given
        AdministratorRequestDTO request = new AdministratorRequestDTO(
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
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.updatedAt").exists());

        // Verify in database
        assertThat(administratorRepository.count()).isEqualTo(1);
        Administrator savedAdmin = administratorRepository.findAll().get(0);
        assertThat(savedAdmin.getFirstName()).isEqualTo("João");
        assertThat(savedAdmin.getLastName()).isEqualTo("Silva");
        assertThat(savedAdmin.getEmail()).isEqualTo("joao.silva@example.com");
        assertThat(savedAdmin.isActive()).isTrue();
        // Verify password is encrypted
        assertThat(passwordEncoder.matches("senha123", savedAdmin.getPassword())).isTrue();
    }

    @Test
    @DisplayName("Should return validation errors for empty fields")
    void shouldReturnValidationErrorsForEmptyFields() throws Exception {
        // Given
        AdministratorRequestDTO request = new AdministratorRequestDTO("", "", "", "");

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
    }

    @Test
    @DisplayName("Should return validation error for invalid email")
    void shouldReturnValidationErrorForInvalidEmail() throws Exception {
        // Given
        AdministratorRequestDTO request = new AdministratorRequestDTO(
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
        AdministratorRequestDTO request = new AdministratorRequestDTO(
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
    @DisplayName("Should return validation error for long fields")
    void shouldReturnValidationErrorForLongFields() throws Exception {
        // Given - Nome com mais de 100 caracteres
        String longName = "a".repeat(101);
        AdministratorRequestDTO request = new AdministratorRequestDTO(
                longName, 
                "Silva", 
                "joao@example.com", 
                "senha123"
        );

        // When & Then
        mockMvc.perform(post("/administrators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.firstName").value("Nome deve ter no máximo 100 caracteres"));
    }

    @Test
    @DisplayName("Should return conflict when email already exists")
    void shouldReturnConflictWhenEmailAlreadyExists() throws Exception {
        // Given - Create an administrator first
        Administrator existingAdmin = new Administrator(
                "Maria", 
                "Santos", 
                "maria@example.com", 
                passwordEncoder.encode("senha123")
        );
        administratorRepository.save(existingAdmin);

        AdministratorRequestDTO request = new AdministratorRequestDTO(
                "João", 
                "Silva", 
                "maria@example.com", // Same email
                "outrasenha"
        );

        // When & Then
        mockMvc.perform(post("/administrators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email já está em uso"));

        // Verify only original admin exists
        assertThat(administratorRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should list administrators successfully")
    void shouldListAdministratorsSuccessfully() throws Exception {
        // Given
        Administrator admin1 = new Administrator("João", "Silva", "joao@example.com", "senha123");
        Administrator admin2 = new Administrator("Maria", "Santos", "maria@example.com", "senha456");
        administratorRepository.save(admin1);
        administratorRepository.save(admin2);

        // When & Then
        mockMvc.perform(get("/administrators"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].firstName").exists())
                .andExpect(jsonPath("$.content[0].lastName").exists())
                .andExpect(jsonPath("$.content[0].email").exists())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("Should find administrator by id")
    void shouldFindAdministratorById() throws Exception {
        // Given
        Administrator admin = new Administrator("João", "Silva", "joao@example.com", "senha123");
        Administrator savedAdmin = administratorRepository.save(admin);

        // When & Then
        mockMvc.perform(get("/administrators/" + savedAdmin.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedAdmin.getId().toString()))
                .andExpect(jsonPath("$.firstName").value("João"))
                .andExpect(jsonPath("$.lastName").value("Silva"))
                .andExpect(jsonPath("$.email").value("joao@example.com"));
    }

    @Test
    @DisplayName("Should return 404 when administrator not found")
    void shouldReturn404WhenAdministratorNotFound() throws Exception {
        // Given
        String nonExistentId = "550e8400-e29b-41d4-a716-446655440000";

        // When & Then
        mockMvc.perform(get("/administrators/" + nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Administrador não encontrado"));
    }

    @Test
    @DisplayName("Should search administrators by name and email")
    void shouldSearchAdministratorsByNameAndEmail() throws Exception {
        // Given
        Administrator admin1 = new Administrator("João", "Silva", "joao.silva@example.com", "senha123");
        Administrator admin2 = new Administrator("Maria", "Santos", "maria.santos@example.com", "senha456");
        Administrator admin3 = new Administrator("Pedro", "João", "pedro.joao@example.com", "senha789");
        administratorRepository.save(admin1);
        administratorRepository.save(admin2);
        administratorRepository.save(admin3);

        // When & Then - Search by first name
        mockMvc.perform(get("/administrators?search=João"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2))); // João Silva and Pedro João
    }

    @Test
    @DisplayName("Should update administrator successfully")
    void shouldUpdateAdministratorSuccessfully() throws Exception {
        // Given
        Administrator admin = new Administrator("João", "Silva", "joao@example.com", "senha123");
        Administrator savedAdmin = administratorRepository.save(admin);

        AdministratorRequestDTO updateRequest = new AdministratorRequestDTO(
                "João Atualizado",
                "Silva Santos",
                "joao.novo@example.com",
                "novasenha123"
        );

        // When & Then
        mockMvc.perform(put("/administrators/" + savedAdmin.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("João Atualizado"))
                .andExpect(jsonPath("$.lastName").value("Silva Santos"))
                .andExpect(jsonPath("$.email").value("joao.novo@example.com"))
                .andExpect(jsonPath("$.fullName").value("João Atualizado Silva Santos"));
    }

    @Test
    @DisplayName("Should patch administrator successfully")
    void shouldPatchAdministratorSuccessfully() throws Exception {
        // Given
        Administrator admin = new Administrator("João", "Silva", "joao@example.com", "senha123");
        Administrator savedAdmin = administratorRepository.save(admin);

        PatchAdministratorRequestDTO patchRequest = new PatchAdministratorRequestDTO(
                "João Modificado",
                null, // keep lastName unchanged
                null, // keep email unchanged
                null  // keep password unchanged
        );

        // When & Then
        mockMvc.perform(patch("/administrators/" + savedAdmin.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patchRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("João Modificado"))
                .andExpect(jsonPath("$.lastName").value("Silva")) // unchanged
                .andExpect(jsonPath("$.email").value("joao@example.com")) // unchanged
                .andExpect(jsonPath("$.fullName").value("João Modificado Silva"));
    }

    @Test
    @DisplayName("Should soft delete administrator")
    void shouldSoftDeleteAdministrator() throws Exception {
        // Given
        Administrator admin = new Administrator("João", "Silva", "joao@example.com", "senha123");
        Administrator savedAdmin = administratorRepository.save(admin);

        // When & Then
        mockMvc.perform(delete("/administrators/" + savedAdmin.getId()))
                .andExpect(status().isNoContent());

        // Verify soft delete
        Administrator deletedAdmin = administratorRepository.findById(savedAdmin.getId()).orElse(null);
        assertThat(deletedAdmin).isNotNull();
        assertThat(deletedAdmin.isInactive()).isTrue();
        assertThat(deletedAdmin.getDeletedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should restore administrator")
    void shouldRestoreAdministrator() throws Exception {
        // Given - Create and soft delete an administrator
        Administrator admin = new Administrator("João", "Silva", "joao@example.com", "senha123");
        admin.deactivate(); // soft delete
        Administrator savedAdmin = administratorRepository.save(admin);

        // When & Then
        mockMvc.perform(patch("/administrators/" + savedAdmin.getId() + "/restore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true));

        // Verify restoration
        Administrator restoredAdmin = administratorRepository.findById(savedAdmin.getId()).orElse(null);
        assertThat(restoredAdmin).isNotNull();
        assertThat(restoredAdmin.isActive()).isTrue();
        assertThat(restoredAdmin.getDeletedAt()).isNull();
    }

    @Test
    @DisplayName("Should handle pagination correctly")
    void shouldHandlePaginationCorrectly() throws Exception {
        // Given - Create multiple administrators
        for (int i = 1; i <= 25; i++) {
            Administrator admin = new Administrator("Nome" + i, "Sobrenome" + i, "email" + i + "@example.com", "senha123");
            administratorRepository.save(admin);
        }

        // When & Then - Test pagination
        mockMvc.perform(get("/administrators?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(10)))
                .andExpect(jsonPath("$.totalElements").value(25))
                .andExpect(jsonPath("$.totalPages").value(3))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(false));

        // Test second page
        mockMvc.perform(get("/administrators?page=1&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(10)))
                .andExpect(jsonPath("$.first").value(false))
                .andExpect(jsonPath("$.last").value(false));

        // Test last page
        mockMvc.perform(get("/administrators?page=2&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.first").value(false))
                .andExpect(jsonPath("$.last").value(true));
    }
}
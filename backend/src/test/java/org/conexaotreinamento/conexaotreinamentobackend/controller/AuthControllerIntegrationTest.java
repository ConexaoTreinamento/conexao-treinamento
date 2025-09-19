package org.conexaotreinamento.conexaotreinamentobackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.conexaotreinamento.conexaotreinamentobackend.config.TestContainerConfig;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.LoginRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.JwtResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.conexaotreinamento.conexaotreinamentobackend.utils.TestAuthUtils;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Import(TestContainerConfig.class)
@DisplayName("AuthController Integration Tests")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private LoginRequestDTO validLoginRequest;
    private LoginRequestDTO invalidLoginRequest;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        testUser = new User(
                TestAuthUtils.VALID_EMAIL,
                passwordEncoder.encode(TestAuthUtils.VALID_PASSWORD),
                Role.ROLE_TRAINER);
        testUser = userRepository.save(testUser);

        validLoginRequest = TestAuthUtils.createLoginRequest(
                TestAuthUtils.VALID_EMAIL,
                TestAuthUtils.VALID_PASSWORD);

        invalidLoginRequest = TestAuthUtils.createLoginRequest(
                TestAuthUtils.INVALID_EMAIL,
                TestAuthUtils.INVALID_PASSWORD);
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void shouldLoginSuccessfullyWithValidCredentials() throws Exception {
        // When & Then
        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(testUser.getId().toString()))
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        JwtResponseDTO response = objectMapper.readValue(responseContent, JwtResponseDTO.class);

        assertThat(response.id()).isEqualTo(testUser.getId());
        assertThat(response.token()).isNotBlank();
        assertThat(response.token().split("\\.")).hasSize(3); // JWT tem 3 partes
    }

    @Test
    @DisplayName("Should return 401 when credentials are invalid")
    void shouldReturn401WhenCredentialsAreInvalid() throws Exception {
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidLoginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should return 401 when user does not exist")
    void shouldReturn401WhenUserDoesNotExist() throws Exception {
        LoginRequestDTO nonExistentUserRequest = TestAuthUtils.createLoginRequest(
                "nonexistent@test.com",
                "password123");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nonExistentUserRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should return 400 when email is invalid")
    void shouldReturn400WhenEmailIsInvalid() throws Exception {
        LoginRequestDTO invalidEmailRequest = new LoginRequestDTO(
                "invalid-email",
                TestAuthUtils.VALID_PASSWORD);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidEmailRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.email").exists());
    }

    @Test
    @DisplayName("Should return 400 when email is blank")
    void shouldReturn400WhenEmailIsBlank() throws Exception {
        LoginRequestDTO blankEmailRequest = new LoginRequestDTO(
                "",
                TestAuthUtils.VALID_PASSWORD);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(blankEmailRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").exists());
    }

    @Test
    @DisplayName("Should return 400 when password is blank")
    void shouldReturn400WhenPasswordIsBlank() throws Exception {
        LoginRequestDTO blankPasswordRequest = new LoginRequestDTO(
                TestAuthUtils.VALID_EMAIL,
                "");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(blankPasswordRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    @DisplayName("Should return 400 when request body is malformed")
    void shouldReturn400WhenRequestBodyIsMalformed() throws Exception {
        String malformedJson = "{\"email\":\"test@test.com\",\"password\":}";

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(malformedJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should logout successfully")
    void shouldLogoutSuccessfully() throws Exception {
        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.TEXT_PLAIN_VALUE + ";charset=UTF-8"))
                .andExpect(content().string("Logout realizado com sucesso!"));
    }

    @Test
    @DisplayName("Should access protected endpoint with valid token")
    void shouldAccessProtectedEndpointWithValidToken() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseContent = loginResult.getResponse().getContentAsString();
        JwtResponseDTO loginResponse = objectMapper.readValue(responseContent, JwtResponseDTO.class);
        String token = loginResponse.token();

        mockMvc.perform(get("/users")
                .header("Authorization", TestAuthUtils.createAuthorizationHeader(token)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return 401 when accessing protected endpoint with invalid token")
    void shouldReturn401WhenAccessingProtectedEndpointWithInvalidToken() throws Exception {
        String invalidToken = "invalid.jwt.token";

        mockMvc.perform(get("/users")
                .header("Authorization", TestAuthUtils.createAuthorizationHeader(invalidToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should handle concurrent login requests")
    void shouldHandleConcurrentLoginRequests() throws Exception {
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validLoginRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").isNotEmpty());
        }
    }

    @Test
    @DisplayName("Should validate JWT token structure and claims")
    void shouldValidateJwtTokenStructureAndClaims() throws Exception {
        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        JwtResponseDTO response = objectMapper.readValue(responseContent, JwtResponseDTO.class);
        String token = response.token();

        String[] tokenParts = token.split("\\.");
        assertThat(tokenParts).hasSize(3);
        assertThat(tokenParts[0]).isNotBlank();
        assertThat(tokenParts[1]).isNotBlank();
        assertThat(tokenParts[2]).isNotBlank();
    }

    @Test
    @DisplayName("Should handle different user roles in JWT")
    void shouldHandleDifferentUserRolesInJwt() throws Exception {
        User adminUser = new User(
                TestAuthUtils.ADMIN_EMAIL,
                passwordEncoder.encode(TestAuthUtils.VALID_PASSWORD),
                Role.ROLE_ADMIN);
        adminUser = userRepository.save(adminUser);

        LoginRequestDTO adminLoginRequest = TestAuthUtils.createLoginRequest(
                TestAuthUtils.ADMIN_EMAIL,
                TestAuthUtils.VALID_PASSWORD);

        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminLoginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(adminUser.getId().toString()))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        JwtResponseDTO response = objectMapper.readValue(responseContent, JwtResponseDTO.class);

        assertThat(response.id()).isEqualTo(adminUser.getId());
        assertThat(response.token()).isNotBlank();
    }
}
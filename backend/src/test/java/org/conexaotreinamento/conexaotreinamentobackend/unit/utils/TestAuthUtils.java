package org.conexaotreinamento.conexaotreinamentobackend.unit.utils;

import org.conexaotreinamento.conexaotreinamentobackend.config.security.user.UserDetailsImpl;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.LoginRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

public class TestAuthUtils {

    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public static User createTestUser(String email, String rawPassword, Role role) {
        String encodedPassword = passwordEncoder.encode(rawPassword);
        return new User(email, encodedPassword, role);
    }

    public static UserDetailsImpl createUserDetails(User user) {
        return new UserDetailsImpl(user);
    }

    public static Authentication createAuthentication(User user) {
        UserDetailsImpl userDetails = createUserDetails(user);
        return new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities());
    }

    public static void setSecurityContext(User user) {
        Authentication auth = createAuthentication(user);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    public static void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    public static LoginRequestDTO createLoginRequest(String email, String password) {
        return new LoginRequestDTO(email, password);
    }

    public static MockHttpServletRequestBuilder createLoginRequest(LoginRequestDTO loginRequest) {
        return post("/auth/login")
                .contentType("application/json")
                .content(String.format(
                        "{\"email\":\"%s\",\"password\":\"%s\"}",
                        loginRequest.email(),
                        loginRequest.password()));
    }

    public static String createAuthorizationHeader(String token) {
        return "Bearer " + token;
    }

    // Test data constants
    public static final String VALID_EMAIL = "test@example.com";
    public static final String VALID_PASSWORD = "password123";
    public static final String INVALID_EMAIL = "invalid@example.com";
    public static final String INVALID_PASSWORD = "wrongpassword";
    public static final String ADMIN_EMAIL = "admin@test.com";
    public static final String TRAINER_EMAIL = "trainer@test.com";
}
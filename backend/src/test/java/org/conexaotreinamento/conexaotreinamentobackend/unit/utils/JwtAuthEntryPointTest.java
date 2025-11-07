package org.conexaotreinamento.conexaotreinamentobackend.unit.utils;

import org.conexaotreinamento.conexaotreinamentobackend.config.security.jwt.JwtAuthEntryPoint;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.session.SessionAuthenticationException;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtAuthEntryPoint Unit Tests")
class JwtAuthEntryPointTest {

    @InjectMocks
    private JwtAuthEntryPoint jwtAuthEntryPoint;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private AuthenticationException authException;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        authException = new BadCredentialsException("Invalid credentials");
    }

    @Test
    @DisplayName("Should set correct response status and content type")
    void shouldSetCorrectResponseStatusAndContentType() throws Exception {
        // Given
        request.setRequestURI("/api/protected");

        // When
        jwtAuthEntryPoint.commence(request, response, authException);

        // Then
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_UNAUTHORIZED);
        assertThat(response.getContentType()).isEqualTo(MediaType.APPLICATION_JSON_VALUE);
    }

    @Test
    @DisplayName("Should return JSON with correct structure and values")
    void shouldReturnJsonWithCorrectStructureAndValues() throws Exception {
        // Given
        String requestUri = "/api/users";
        request.setRequestURI(requestUri);
        Instant beforeTest = Instant.now();

        // When
        jwtAuthEntryPoint.commence(request, response, authException);

        // Then
        String responseContent = response.getContentAsString();
        assertThat(responseContent).isNotBlank();

        assertThat(responseContent).startsWith("{");
        assertThat(responseContent).endsWith("}");

        assertThat(responseContent).contains("\"timestamp\":");
        assertThat(responseContent).contains("\"status\":401");
        assertThat(responseContent).contains("\"error\":\"Unauthorized\"");
        assertThat(responseContent).contains("\"message\":\"You may login and try again!\"");
        assertThat(responseContent).contains("\"path\":\"" + requestUri + "\"");
    }

    @Test
    @DisplayName("Should handle BadCredentialsException")
    void shouldHandleBadCredentialsException() throws Exception {
        // Given
        AuthenticationException badCredentials = new BadCredentialsException("Bad credentials");
        request.setRequestURI("/api/login");

        // When
        jwtAuthEntryPoint.commence(request, response, badCredentials);

        // Then
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_UNAUTHORIZED);

        String responseContent = response.getContentAsString();
        assertThat(responseContent).contains("\"status\":401");
        assertThat(responseContent).contains("\"error\":\"Unauthorized\"");
        assertThat(responseContent).contains("\"message\":\"You may login and try again!\"");
    }

    @Test
    @DisplayName("Should handle InsufficientAuthenticationException")
    void shouldHandleInsufficientAuthenticationException() throws Exception {
        // Given
        AuthenticationException insufficientAuth = new InsufficientAuthenticationException(
                "Insufficient authentication");
        request.setRequestURI("/api/admin");

        // When
        jwtAuthEntryPoint.commence(request, response, insufficientAuth);

        // Then
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_UNAUTHORIZED);

        String responseContent = response.getContentAsString();
        assertThat(responseContent).contains("\"status\":401");
        assertThat(responseContent).contains("\"error\":\"Unauthorized\"");
    }

    @Test
    @DisplayName("Should handle SessionAuthenticationException")
    void shouldHandleSessionAuthenticationException() throws Exception {
        // Given
        AuthenticationException sessionAuth = new SessionAuthenticationException("Session expired");
        request.setRequestURI("/api/session");

        // When
        jwtAuthEntryPoint.commence(request, response, sessionAuth);

        // Then
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_UNAUTHORIZED);

        String responseContent = response.getContentAsString();
        assertThat(responseContent).contains("\"status\":401");
    }

    @Test
    @DisplayName("Should handle null AuthenticationException")
    void shouldHandleNullAuthenticationException() throws Exception {
        // Given
        request.setRequestURI("/api/test");

        // When
        jwtAuthEntryPoint.commence(request, response, null);

        // Then
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_UNAUTHORIZED);

        String responseContent = response.getContentAsString();
        assertThat(responseContent).isNotBlank();
        assertThat(responseContent).contains("\"status\":401");
    }

    @Test
    @DisplayName("Should produce valid JSON output")
    void shouldProduceValidJsonOutput() throws Exception {
        // Given
        request.setRequestURI("/api/test");

        // When
        jwtAuthEntryPoint.commence(request, response, authException);

        // Then
        String responseContent = response.getContentAsString();

        assertThatCode(() -> {
            assertThat(responseContent).startsWith("{");
            assertThat(responseContent).endsWith("}");
            assertThat(responseContent).contains(":");
            assertThat(responseContent).contains(",");
        }).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Should handle different request URIs correctly")
    void shouldHandleDifferentRequestUrisCorrectly() throws Exception {
        String[] testUris = {
                "/api/users",
                "/api/exercises",
                "/admin/dashboard",
                "/public/info"
        };

        for (String uri : testUris) {
            // Given
            request = new MockHttpServletRequest();
            response = new MockHttpServletResponse();
            request.setRequestURI(uri);

            // When
            jwtAuthEntryPoint.commence(request, response, authException);

            // Then
            String responseContent = response.getContentAsString();
            assertThat(responseContent).contains("\"path\":\"" + uri + "\"");
        }
    }

    @Test
    @DisplayName("Should maintain consistent error message regardless of exception type")
    void shouldMaintainConsistentErrorMessageRegardlessOfExceptionType() throws Exception {
        AuthenticationException[] exceptions = {
                new BadCredentialsException("Bad credentials"),
                new InsufficientAuthenticationException("Insufficient auth"),
                new SessionAuthenticationException("Session expired")
        };

        for (AuthenticationException exception : exceptions) {
            // Given
            request = new MockHttpServletRequest();
            response = new MockHttpServletResponse();
            request.setRequestURI("/api/test");

            // When
            jwtAuthEntryPoint.commence(request, response, exception);

            // Then
            String responseContent = response.getContentAsString();
            assertThat(responseContent).contains("\"message\":\"You may login and try again!\"");
        }
    }

    @Test
    @DisplayName("Should handle request without URI")
    void shouldHandleRequestWithoutUri() throws Exception {
        // Given - request sem URI definida

        // When
        jwtAuthEntryPoint.commence(request, response, authException);

        // Then
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_UNAUTHORIZED);

        String responseContent = response.getContentAsString();
        assertThat(responseContent).isNotBlank();
        assertThat(responseContent).contains("\"status\":401");
    }
}
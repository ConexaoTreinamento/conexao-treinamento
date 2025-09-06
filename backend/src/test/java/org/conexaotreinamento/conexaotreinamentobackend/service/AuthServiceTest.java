package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.config.security.jwt.JwtService;
import org.conexaotreinamento.conexaotreinamentobackend.config.security.user.UserDetailsImpl;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.LoginRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.JwtResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.utils.TestAuthUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private LoginRequestDTO validLoginRequest;
    private Authentication mockAuthentication;
    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        testUser = TestAuthUtils.createTestUser("user@test.com", "password123", Role.ROLE_TRAINER);
        validLoginRequest = TestAuthUtils.createLoginRequest("user@test.com", "password123");
        userDetails = TestAuthUtils.createUserDetails(testUser);
        mockAuthentication = TestAuthUtils.createAuthentication(testUser);
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void shouldLoginSuccessfullyWithValidCredentials() {
        // Given
        String expectedToken = "jwt.token.here";
        UUID expectedUserId = testUser.getId();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuthentication);
        when(jwtService.generateToken(mockAuthentication))
                .thenReturn(expectedToken);

        // When
        JwtResponseDTO response = authService.login(validLoginRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo(expectedToken);
        assertThat(response.id()).isEqualTo(expectedUserId);

        Authentication contextAuth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(contextAuth).isNotNull();
        assertThat(contextAuth.getPrincipal()).isInstanceOf(UserDetailsImpl.class);

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService).generateToken(mockAuthentication);
    }

    @Test
    @DisplayName("Should throw exception when authentication fails")
    void shouldThrowExceptionWhenAuthenticationFails() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // When & Then
        assertThatThrownBy(() -> authService.login(validLoginRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid credentials");

        Authentication contextAuth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(contextAuth).isNull();

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    @DisplayName("Should logout successfully and clear security context")
    void shouldLogoutSuccessfullyAndClearSecurityContext() {
        // Given - Set up security context
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                new UserDetailsImpl(testUser), null, userDetails.getAuthorities()));
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();

        // When
        authService.logout();

        // Then
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("Should handle logout when no authentication context exists")
    void shouldHandleLogoutWhenNoAuthenticationContextExists() {
        // Given - Ensure no security context
        SecurityContextHolder.clearContext();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();

        // When & Then - Should not throw exception
        assertThatCode(() -> authService.logout()).doesNotThrowAnyException();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("Should create correct authentication token for login")
    void shouldCreateCorrectAuthenticationTokenForLogin() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuthentication);
        when(jwtService.generateToken(any())).thenReturn("token");

        // When
        authService.login(validLoginRequest);

        // Then
        verify(authenticationManager)
                .authenticate(argThat(token -> token instanceof UsernamePasswordAuthenticationToken &&
                        token.getPrincipal().equals(validLoginRequest.email()) &&
                        token.getCredentials().equals(validLoginRequest.password())));
    }
}
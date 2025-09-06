package org.conexaotreinamento.conexaotreinamentobackend.utils;

import org.conexaotreinamento.conexaotreinamentobackend.config.security.jwt.JwtAuthenticationFilter;
import org.conexaotreinamento.conexaotreinamentobackend.config.security.jwt.JwtService;
import org.conexaotreinamento.conexaotreinamentobackend.config.security.user.UserDetailsImpl;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtAuthenticationFilter Unit Tests")
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private User testUser;
    private UserDetailsImpl userDetails;
    private final String validToken = "valid.jwt.token";
    private final String invalidToken = "invalid.jwt.token";
    private final String bearerToken = "Bearer " + validToken;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        testUser = TestAuthUtils.createTestUser(TestAuthUtils.VALID_EMAIL, TestAuthUtils.VALID_PASSWORD,
                Role.ROLE_TRAINER);
        userDetails = TestAuthUtils.createUserDetails(testUser);
    }

    @Test
    @DisplayName("Should authenticate successfully with valid token")
    void shouldAuthenticateSuccessfullyWithValidToken() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn(bearerToken);
        when(jwtService.isTokenValid(validToken)).thenReturn(true);
        when(jwtService.extractUsername(validToken)).thenReturn(TestAuthUtils.VALID_EMAIL);
        when(userDetailsService.loadUserByUsername(TestAuthUtils.VALID_EMAIL)).thenReturn(userDetails);

        // When
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // Then
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo(userDetails);
        assertThat(SecurityContextHolder.getContext().getAuthentication().getAuthorities())
                .isEqualTo(userDetails.getAuthorities());

        verify(jwtService).isTokenValid(validToken);
        verify(jwtService).extractUsername(validToken);
        verify(userDetailsService).loadUserByUsername(TestAuthUtils.VALID_EMAIL);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should continue filter chain when no token provided")
    void shouldContinueFilterChainWhenNoTokenProvided() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn(null);

        // When
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // Then
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtService, never()).isTokenValid(any());
        verify(jwtService, never()).extractUsername(any());
        verify(userDetailsService, never()).loadUserByUsername(any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should continue filter chain when token is empty")
    void shouldContinueFilterChainWhenTokenIsEmpty() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn("");

        // When
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // Then
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtService, never()).isTokenValid(any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should continue filter chain when token doesn't start with Bearer")
    void shouldContinueFilterChainWhenTokenDoesntStartWithBearer() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn("Basic " + validToken);

        // When
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // Then
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtService, never()).isTokenValid(any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should continue filter chain when token is invalid")
    void shouldContinueFilterChainWhenTokenIsInvalid() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn("Bearer " + invalidToken);
        when(jwtService.isTokenValid(invalidToken)).thenReturn(false);

        // When
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // Then
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtService).isTokenValid(invalidToken);
        verify(jwtService, never()).extractUsername(any());
        verify(userDetailsService, never()).loadUserByUsername(any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should extract token correctly from Authorization header")
    void shouldExtractTokenCorrectlyFromAuthorizationHeader() throws ServletException, IOException {
        // Given
        String testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature";
        when(request.getHeader("Authorization")).thenReturn("Bearer " + testToken);
        when(jwtService.isTokenValid(testToken)).thenReturn(true);
        when(jwtService.extractUsername(testToken)).thenReturn(TestAuthUtils.VALID_EMAIL);
        when(userDetailsService.loadUserByUsername(TestAuthUtils.VALID_EMAIL)).thenReturn(userDetails);
        // Removed getRequestURI stubbing - only needed for exception handling

        // When
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // Then
        verify(jwtService).isTokenValid(testToken);
        verify(jwtService).extractUsername(testToken);
        verify(filterChain).doFilter(request, response);
    }
}
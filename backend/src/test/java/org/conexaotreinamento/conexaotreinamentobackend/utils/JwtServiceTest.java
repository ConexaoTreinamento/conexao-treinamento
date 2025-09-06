package org.conexaotreinamento.conexaotreinamentobackend.utils;

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
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtService Unit Tests")
class JwtServiceTest {

    @Mock
    private JwtEncoder jwtEncoder;

    @Mock
    private JwtDecoder jwtDecoder;

    @InjectMocks
    private JwtService jwtService;

    private User testUser;
    private Authentication authentication;
    private UserDetailsImpl userDetails;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUser = TestAuthUtils.createTestUser(TestAuthUtils.VALID_EMAIL, TestAuthUtils.VALID_PASSWORD, Role.ROLE_TRAINER);

        ReflectionTestUtils.setField(testUser, "id", testUserId);
        
        userDetails = TestAuthUtils.createUserDetails(testUser);
        authentication = TestAuthUtils.createAuthentication(testUser);

        ReflectionTestUtils.setField(jwtService, "expirationHours", 24L);
    }

    @Test
    @DisplayName("Should generate valid JWT token")
    void shouldGenerateValidJwtToken() {
        // Given
        String expectedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";
        org.springframework.security.oauth2.jwt.Jwt mockJwt = mock(org.springframework.security.oauth2.jwt.Jwt.class);

        when(mockJwt.getTokenValue()).thenReturn(expectedToken);
        when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(mockJwt);

        // When
        String actualToken = jwtService.generateToken(authentication);

        // Then
        assertThat(actualToken).isEqualTo(expectedToken);
        verify(jwtEncoder).encode(any(JwtEncoderParameters.class));
    }

    @Test
    @DisplayName("Should generate refresh token")
    void shouldGenerateRefreshToken() {
        // Given
        String expectedRefreshToken = "refresh.token.here";
        org.springframework.security.oauth2.jwt.Jwt mockJwt = mock(org.springframework.security.oauth2.jwt.Jwt.class);

        when(mockJwt.getTokenValue()).thenReturn(expectedRefreshToken);
        when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(mockJwt);

        // When
        String actualToken = jwtService.generateRefreshToken(authentication);

        // Then
        assertThat(actualToken).isEqualTo(expectedRefreshToken);
        verify(jwtEncoder).encode(any(JwtEncoderParameters.class));
    }

    @Test
    @DisplayName("Should validate valid token")
    void shouldValidateValidToken() {
        // Given
        String validToken = "valid.jwt.token";
        Jwt mockJwt = createMockJwt();

        when(jwtDecoder.decode(validToken)).thenReturn(mockJwt);

        // When
        boolean isValid = jwtService.isTokenValid(validToken);

        // Then
        assertThat(isValid).isTrue();
        verify(jwtDecoder).decode(validToken);
    }

    @Test
    @DisplayName("Should reject invalid token")
    void shouldRejectInvalidToken() {
        // Given
        String invalidToken = "invalid.jwt.token";

        when(jwtDecoder.decode(invalidToken)).thenThrow(new JwtException("Invalid token"));

        // When
        boolean isValid = jwtService.isTokenValid(invalidToken);

        // Then
        assertThat(isValid).isFalse();
        verify(jwtDecoder).decode(invalidToken);
    }

    @Test
    @DisplayName("Should extract username from token")
    void shouldExtractUsernameFromToken() {
        // Given
        String token = "valid.jwt.token";
        Jwt mockJwt = mock(Jwt.class);
    
        when(jwtDecoder.decode(token)).thenReturn(mockJwt);
        when(mockJwt.getSubject()).thenReturn(TestAuthUtils.VALID_EMAIL);
    
        // When
        String username = jwtService.extractUsername(token);
    
        // Then
        assertThat(username).isEqualTo(TestAuthUtils.VALID_EMAIL);
        verify(jwtDecoder).decode(token);
        verify(mockJwt).getSubject();
    }
    
    @Test
    @DisplayName("Should handle null token gracefully")
    void shouldHandleNullTokenGracefully() {
        // When & Then
        assertThatThrownBy(() -> jwtService.isTokenValid(null))
                .isInstanceOf(JwtException.class)
                .hasMessage("Token cannot be null or empty");
    
        assertThatThrownBy(() -> jwtService.extractUsername(null))
                .isInstanceOf(JwtException.class)
                .hasMessage("Token cannot be null or empty");
    }
    
    @Test
    @DisplayName("Should handle empty token gracefully")
    void shouldHandleEmptyTokenGracefully() {
        // When & Then
        assertThatThrownBy(() -> jwtService.isTokenValid(""))
                .isInstanceOf(JwtException.class)
                .hasMessage("Token cannot be null or empty");
    
        assertThatThrownBy(() -> jwtService.extractUsername(""))
                .isInstanceOf(JwtException.class)
                .hasMessage("Token cannot be null or empty");
    
        assertThatThrownBy(() -> jwtService.isTokenValid("   "))
                .isInstanceOf(JwtException.class)
                .hasMessage("Token cannot be null or empty");
    
        assertThatThrownBy(() -> jwtService.extractUsername("   "))
                .isInstanceOf(JwtException.class)
                .hasMessage("Token cannot be null or empty");
    }

    private Jwt createMockJwt() {
        return new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plus(1, ChronoUnit.HOURS),
                Map.of("alg", "HS256"),
                Map.of(
                        "sub", TestAuthUtils.VALID_EMAIL,
                        "iss", "conexao-treinamento",
                        "userId", testUserId.toString(),
                        "role", "ROLE_TRAINER"));
    }
}
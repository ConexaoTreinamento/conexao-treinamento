package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.config.security.jwt.JwtService;
import org.conexaotreinamento.conexaotreinamentobackend.config.security.user.UserDetailsImpl;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.LoginRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.JwtResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceMockTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private AuthService authService;

    private LoginRequestDTO loginRequestDTO;
    private UserDetailsImpl userDetails;
    private UUID userId;
    private User user;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        loginRequestDTO = new LoginRequestDTO("admin@example.com", "password123");
        
        user = new User("admin@example.com", "encodedPassword", Role.ROLE_ADMIN);
        setIdViaReflection(user, userId);
        
        userDetails = new UserDetailsImpl(user);
    }

    private void setIdViaReflection(User user, UUID id) {
        try {
            var field = User.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(user, id);
        } catch (Exception e) {
            fail("Failed to set User.id via reflection: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("Should login user successfully")
    void shouldLoginUserSuccessfully() {
        // Given
        String expectedToken = "jwt.token.here";
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtService.generateToken(authentication)).thenReturn(expectedToken);

        try (MockedStatic<SecurityContextHolder> securityContextHolder = mockStatic(SecurityContextHolder.class)) {
            securityContextHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            
            // When
            JwtResponseDTO result = authService.login(loginRequestDTO);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(userId);
            assertThat(result.token()).isEqualTo(expectedToken);

            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(jwtService).generateToken(authentication);
            verify(securityContext).setAuthentication(authentication);
        }
    }

    @Test
    @DisplayName("Should throw exception when authentication fails")
    void shouldThrowExceptionWhenAuthenticationFails() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // When & Then
        assertThatThrownBy(() -> authService.login(loginRequestDTO))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid credentials");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    @DisplayName("Should login trainer user successfully")
    void shouldLoginTrainerUserSuccessfully() {
        // Given
        LoginRequestDTO trainerLogin = new LoginRequestDTO("trainer@example.com", "trainerpass");
        User trainerUser = new User("trainer@example.com", "encodedPassword", Role.ROLE_TRAINER);
        UUID trainerId = UUID.randomUUID();
        setIdViaReflection(trainerUser, trainerId);
        UserDetailsImpl trainerDetails = new UserDetailsImpl(trainerUser);
        String expectedToken = "trainer.jwt.token";
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(trainerDetails);
        when(jwtService.generateToken(authentication)).thenReturn(expectedToken);

        try (MockedStatic<SecurityContextHolder> securityContextHolder = mockStatic(SecurityContextHolder.class)) {
            securityContextHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            
            // When
            JwtResponseDTO result = authService.login(trainerLogin);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(trainerDetails.getId());
            assertThat(result.token()).isEqualTo(expectedToken);

            verify(authenticationManager).authenticate(argThat(auth -> 
                auth.getPrincipal().equals("trainer@example.com") &&
                auth.getCredentials().equals("trainerpass")
            ));
        }
    }

    @Test
    @DisplayName("Should logout user successfully")
    void shouldLogoutUserSuccessfully() {
        // Given
        try (MockedStatic<SecurityContextHolder> securityContextHolder = mockStatic(SecurityContextHolder.class)) {
            
            // When
            authService.logout();

            // Then
            securityContextHolder.verify(SecurityContextHolder::clearContext);
        }
    }

    @Test
    @DisplayName("Should handle authentication with different email formats")
    void shouldHandleAuthenticationWithDifferentEmailFormats() {
        // Given
        LoginRequestDTO upperCaseLogin = new LoginRequestDTO("ADMIN@EXAMPLE.COM", "password123");
        String expectedToken = "case.insensitive.token";
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtService.generateToken(authentication)).thenReturn(expectedToken);

        try (MockedStatic<SecurityContextHolder> securityContextHolder = mockStatic(SecurityContextHolder.class)) {
            securityContextHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            
            // When
            JwtResponseDTO result = authService.login(upperCaseLogin);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.token()).isEqualTo(expectedToken);

            verify(authenticationManager).authenticate(argThat(auth -> 
                auth.getPrincipal().equals("ADMIN@EXAMPLE.COM")
            ));
        }
    }

    @Test
    @DisplayName("Should handle long passwords correctly")
    void shouldHandleLongPasswordsCorrectly() {
        // Given
        String longPassword = "a".repeat(100);
        LoginRequestDTO longPasswordLogin = new LoginRequestDTO("user@example.com", longPassword);
        String expectedToken = "long.password.token";
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtService.generateToken(authentication)).thenReturn(expectedToken);

        try (MockedStatic<SecurityContextHolder> securityContextHolder = mockStatic(SecurityContextHolder.class)) {
            securityContextHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            
            // When
            JwtResponseDTO result = authService.login(longPasswordLogin);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.token()).isEqualTo(expectedToken);

            verify(authenticationManager).authenticate(argThat(auth -> 
                auth.getCredentials().equals(longPassword)
            ));
        }
    }

    @Test
    @DisplayName("Should handle special characters in credentials")
    void shouldHandleSpecialCharactersInCredentials() {
        // Given
        LoginRequestDTO specialCharLogin = new LoginRequestDTO(
                "user+test@example-site.com", 
                "p@ssw0rd!#$%"
        );
        String expectedToken = "special.chars.token";
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtService.generateToken(authentication)).thenReturn(expectedToken);

        try (MockedStatic<SecurityContextHolder> securityContextHolder = mockStatic(SecurityContextHolder.class)) {
            securityContextHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            
            // When
            JwtResponseDTO result = authService.login(specialCharLogin);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.token()).isEqualTo(expectedToken);

            verify(authenticationManager).authenticate(argThat(auth -> 
                auth.getPrincipal().equals("user+test@example-site.com") &&
                auth.getCredentials().equals("p@ssw0rd!#$%")
            ));
        }
    }

    @Test
    @DisplayName("Should handle JWT service exceptions")
    void shouldHandleJwtServiceExceptions() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtService.generateToken(authentication))
                .thenThrow(new RuntimeException("JWT generation failed"));

        try (MockedStatic<SecurityContextHolder> securityContextHolder = mockStatic(SecurityContextHolder.class)) {
            securityContextHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            
            // When & Then
            assertThatThrownBy(() -> authService.login(loginRequestDTO))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("JWT generation failed");

            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(securityContext).setAuthentication(authentication);
            verify(jwtService).generateToken(authentication);
        }
    }

    @Test
    @DisplayName("Should maintain security context during login process")
    void shouldMaintainSecurityContextDuringLoginProcess() {
        // Given
        String expectedToken = "context.token";
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtService.generateToken(authentication)).thenReturn(expectedToken);

        try (MockedStatic<SecurityContextHolder> securityContextHolder = mockStatic(SecurityContextHolder.class)) {
            securityContextHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            
            // When
            JwtResponseDTO result = authService.login(loginRequestDTO);

            // Then
            assertThat(result).isNotNull();
            
            // Verify the correct sequence of security context operations
            var inOrder = inOrder(securityContext);
            inOrder.verify(securityContext).setAuthentication(authentication);
            
            securityContextHolder.verify(SecurityContextHolder::getContext);
        }
    }

    @Test
    @DisplayName("Should handle null authentication response")
    void shouldHandleNullAuthenticationResponse() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);

        // When & Then
        assertThatThrownBy(() -> authService.login(loginRequestDTO))
                .isInstanceOf(NullPointerException.class);

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    @DisplayName("Should handle multiple consecutive login attempts")
    void shouldHandleMultipleConsecutiveLoginAttempts() {
        // Given
        String token1 = "first.token";
        String token2 = "second.token";
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtService.generateToken(authentication))
                .thenReturn(token1)
                .thenReturn(token2);

        try (MockedStatic<SecurityContextHolder> securityContextHolder = mockStatic(SecurityContextHolder.class)) {
            securityContextHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            
            // When
            JwtResponseDTO result1 = authService.login(loginRequestDTO);
            JwtResponseDTO result2 = authService.login(loginRequestDTO);

            // Then
            assertThat(result1.token()).isEqualTo(token1);
            assertThat(result2.token()).isEqualTo(token2);
            assertThat(result1.id()).isEqualTo(result2.id());

            verify(authenticationManager, times(2)).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(jwtService, times(2)).generateToken(authentication);
        }
    }
}

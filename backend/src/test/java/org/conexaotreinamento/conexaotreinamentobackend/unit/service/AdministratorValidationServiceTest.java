package org.conexaotreinamento.conexaotreinamentobackend.unit.service;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AdministratorRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.AdministratorValidationService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdministratorValidationService Unit Tests")
class AdministratorValidationServiceTest {

    @Mock
    private AdministratorRepository administratorRepository;

    @InjectMocks
    private AdministratorValidationService validationService;

    private String email;
    private UUID userId;

    @BeforeEach
    void setUp() {
        email = "admin@example.com";
        userId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should pass validation when email does not exist")
    void shouldPassValidationWhenEmailDoesNotExist() {
        // Given
        when(administratorRepository.existsByEmailIgnoreCase(email)).thenReturn(false);

        // When & Then
        validationService.validateEmailUniqueness(email);
        // No exception thrown

        verify(administratorRepository).existsByEmailIgnoreCase(email);
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        // Given
        when(administratorRepository.existsByEmailIgnoreCase(email)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> validationService.validateEmailUniqueness(email))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Administrator with email 'admin@example.com' already exists");

        verify(administratorRepository).existsByEmailIgnoreCase(email);
    }

    @Test
    @DisplayName("Should pass validation when email does not exist excluding specific user ID")
    void shouldPassValidationWhenEmailDoesNotExistExcludingUserId() {
        // Given
        when(administratorRepository.existsByEmailIgnoreCaseAndUserIdNot(email, userId)).thenReturn(false);

        // When & Then
        validationService.validateEmailUniqueness(email, userId);
        // No exception thrown

        verify(administratorRepository).existsByEmailIgnoreCaseAndUserIdNot(email, userId);
    }

    @Test
    @DisplayName("Should throw exception when email exists excluding specific user ID")
    void shouldThrowExceptionWhenEmailExistsExcludingUserId() {
        // Given
        when(administratorRepository.existsByEmailIgnoreCaseAndUserIdNot(email, userId)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> validationService.validateEmailUniqueness(email, userId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Administrator with email 'admin@example.com' already exists");

        verify(administratorRepository).existsByEmailIgnoreCaseAndUserIdNot(email, userId);
    }

    @Test
    @DisplayName("Should use correct error code when email exists")
    void shouldUseCorrectErrorCodeWhenEmailExists() {
        // Given
        when(administratorRepository.existsByEmailIgnoreCase(email)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> validationService.validateEmailUniqueness(email))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Administrator with email 'admin@example.com' already exists")
                .satisfies(exception -> {
                    BusinessException bex = (BusinessException) exception;
                    assertThat(bex.getErrorCode()).isEqualTo("DUPLICATE_EMAIL");
                });
    }
}


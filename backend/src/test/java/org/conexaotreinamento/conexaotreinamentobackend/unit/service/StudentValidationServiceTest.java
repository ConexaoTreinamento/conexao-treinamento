package org.conexaotreinamento.conexaotreinamentobackend.unit.service;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentValidationService;
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
@DisplayName("StudentValidationService Unit Tests")
class StudentValidationServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentValidationService validationService;

    private String email;
    private UUID studentId;

    @BeforeEach
    void setUp() {
        email = "test@example.com";
        studentId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should pass validation when email does not exist")
    void shouldPassValidationWhenEmailDoesNotExist() {
        // Given
        when(studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(email)).thenReturn(false);

        // When & Then
        validationService.validateEmailUniqueness(email);
        // No exception thrown

        verify(studentRepository).existsByEmailIgnoringCaseAndDeletedAtIsNull(email);
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        // Given
        when(studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(email)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> validationService.validateEmailUniqueness(email))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Student with email 'test@example.com' already exists");

        verify(studentRepository).existsByEmailIgnoringCaseAndDeletedAtIsNull(email);
    }

    @Test
    @DisplayName("Should pass validation when email does not exist excluding specific ID")
    void shouldPassValidationWhenEmailDoesNotExistExcludingId() {
        // Given
        when(studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNullAndIdNot(email, studentId)).thenReturn(false);

        // When & Then
        validationService.validateEmailUniqueness(email, studentId);
        // No exception thrown

        verify(studentRepository).existsByEmailIgnoringCaseAndDeletedAtIsNullAndIdNot(email, studentId);
    }

    @Test
    @DisplayName("Should throw exception when email exists excluding specific ID")
    void shouldThrowExceptionWhenEmailExistsExcludingId() {
        // Given
        when(studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNullAndIdNot(email, studentId)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> validationService.validateEmailUniqueness(email, studentId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Student with email 'test@example.com' already exists");

        verify(studentRepository).existsByEmailIgnoringCaseAndDeletedAtIsNullAndIdNot(email, studentId);
    }

    @Test
    @DisplayName("Should use correct error code when email exists")
    void shouldUseCorrectErrorCodeWhenEmailExists() {
        // Given
        when(studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(email)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> validationService.validateEmailUniqueness(email))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Student with email 'test@example.com' already exists")
                .satisfies(exception -> {
                    BusinessException bex = (BusinessException) exception;
                    assertThat(bex.getErrorCode()).isEqualTo("DUPLICATE_EMAIL");
                });
    }
}


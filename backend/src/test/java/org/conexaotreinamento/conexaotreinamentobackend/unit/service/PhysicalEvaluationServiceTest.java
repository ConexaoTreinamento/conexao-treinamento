package org.conexaotreinamento.conexaotreinamentobackend.unit.service;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PhysicalEvaluationRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.PhysicalEvaluationResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalEvaluation;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.repository.PhysicalEvaluationRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.PhysicalEvaluationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PhysicalEvaluationServiceTest {

    @Mock
    private PhysicalEvaluationRepository evaluationRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private PhysicalEvaluationService evaluationService;

    private UUID studentId;
    private UUID evaluationId;
    private Student student;
    private PhysicalEvaluationRequestDTO requestDTO;
    private PhysicalEvaluation evaluation;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        evaluationId = UUID.randomUUID();

        student = new Student(
                "test@example.com",
                "John",
                "Doe",
                Student.Gender.M,
                LocalDate.of(1990, 1, 1)
        );

        requestDTO = new PhysicalEvaluationRequestDTO(
                70.0,
                175.0,
                null,
                null,
                null
        );

        evaluation = new PhysicalEvaluation(
                student,
                LocalDate.now(),
                70.0,
                175.0,
                22.9
        );
        ReflectionTestUtils.setField(student, "id", studentId);
    }

    @Test
    void create_ShouldCreateEvaluationSuccessfully() {
        // Given
        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.of(student));
        when(evaluationRepository.save(any(PhysicalEvaluation.class))).thenReturn(evaluation);

        // When
        PhysicalEvaluationResponseDTO result = evaluationService.create(studentId, requestDTO);

        // Then
        assertNotNull(result);
        assertEquals(70.0, result.weight());
        assertEquals(175.0, result.height());
        verify(studentRepository).findByIdAndDeletedAtIsNull(studentId);
        verify(evaluationRepository).save(any(PhysicalEvaluation.class));
    }

    @Test
    void create_ShouldThrowException_WhenStudentNotFound() {
        // Given
        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResponseStatusException.class, () -> evaluationService.create(studentId, requestDTO));
        verify(evaluationRepository, never()).save(any());
    }

    @Test
    void findById_ShouldReturnEvaluation_WhenExists() {
        // Given
        when(evaluationRepository.findByIdAndStudentIdAndDeletedAtIsNull(evaluationId, studentId))
                .thenReturn(Optional.of(evaluation));

        // When
        PhysicalEvaluationResponseDTO result = evaluationService.findById(studentId, evaluationId);

        // Then
        assertNotNull(result);
        verify(evaluationRepository).findByIdAndStudentIdAndDeletedAtIsNull(evaluationId, studentId);
    }

    @Test
    void findById_ShouldThrowException_WhenNotFound() {
        // Given
        when(evaluationRepository.findByIdAndStudentIdAndDeletedAtIsNull(evaluationId, studentId))
                .thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResponseStatusException.class, () -> evaluationService.findById(studentId, evaluationId));
    }

    @Test
    void findAllByStudentId_ShouldReturnEvaluationsList() {
        // Given
        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.of(student));
        when(evaluationRepository.findByStudentIdAndDeletedAtIsNullOrderByDateDesc(studentId))
                .thenReturn(List.of(evaluation));

        // When
        List<PhysicalEvaluationResponseDTO> result = evaluationService.findAllByStudentId(studentId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(evaluationRepository).findByStudentIdAndDeletedAtIsNullOrderByDateDesc(studentId);
    }

    @Test
    void update_ShouldUpdateEvaluationSuccessfully() {
        // Given
    when(evaluationRepository.findByIdAndStudentIdAndDeletedAtIsNull(evaluationId, studentId))
        .thenReturn(Optional.of(evaluation));
        when(evaluationRepository.save(any(PhysicalEvaluation.class))).thenReturn(evaluation);

        PhysicalEvaluationRequestDTO updateRequest = new PhysicalEvaluationRequestDTO(
                75.0,
                175.0,
                null,
                null,
                null
        );

        // When
    PhysicalEvaluationResponseDTO result = evaluationService.update(studentId, evaluationId, updateRequest);

        // Then
        assertNotNull(result);
    verify(evaluationRepository).findByIdAndStudentIdAndDeletedAtIsNull(evaluationId, studentId);
        verify(evaluationRepository).save(any(PhysicalEvaluation.class));
    }

    @Test
    void delete_ShouldSoftDeleteEvaluation() {
        // Given
    when(evaluationRepository.findByIdAndStudentIdAndDeletedAtIsNull(evaluationId, studentId))
        .thenReturn(Optional.of(evaluation));

        // When
        evaluationService.delete(studentId, evaluationId);

        // Then
    verify(evaluationRepository).findByIdAndStudentIdAndDeletedAtIsNull(evaluationId, studentId);
        verify(evaluationRepository).save(evaluation);
        assertNotNull(evaluation.getDeletedAt());
    }

    @Test
    void delete_ShouldThrowException_WhenEvaluationDoesNotBelongToStudent() {
    when(evaluationRepository.findByIdAndStudentIdAndDeletedAtIsNull(evaluationId, studentId))
        .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> evaluationService.delete(studentId, evaluationId));
        verify(evaluationRepository, never()).save(any());
    }

    @Test
    void create_ShouldCalculateBMICorrectly() {
        // Given
        PhysicalEvaluationRequestDTO request = new PhysicalEvaluationRequestDTO(
                68.5,
                165.0,
                null,
                null,
                null
        );

        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.of(student));
        when(evaluationRepository.save(any(PhysicalEvaluation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        PhysicalEvaluationResponseDTO result = evaluationService.create(studentId, request);

        // Then
        assertNotNull(result);
        // BMI = 68.5 / (1.65)^2 = 25.2
        assertEquals(25.2, result.bmi(), 0.1);
    }

    @Test
    void create_ShouldMapNestedObjectsCorrectly() {
        // Given
        PhysicalEvaluationRequestDTO.CircumferencesDTO circumferencesDTO = new PhysicalEvaluationRequestDTO.CircumferencesDTO(
            30.0, 30.0, 32.0, 32.0, 80.0, 85.0, 100.0, 55.0, 55.0, 35.0, 35.0
        );
        PhysicalEvaluationRequestDTO.SubcutaneousFoldsDTO foldsDTO = new PhysicalEvaluationRequestDTO.SubcutaneousFoldsDTO(
            10.0, 12.0, 15.0, 18.0, 20.0, 22.0, 25.0
        );
        PhysicalEvaluationRequestDTO.DiametersDTO diametersDTO = new PhysicalEvaluationRequestDTO.DiametersDTO(
            10.0, 12.0
        );
        
        PhysicalEvaluationRequestDTO fullRequest = new PhysicalEvaluationRequestDTO(
                70.0,
                175.0,
                circumferencesDTO,
                foldsDTO,
                diametersDTO
        );

        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.of(student));
        when(evaluationRepository.save(any(PhysicalEvaluation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        PhysicalEvaluationResponseDTO result = evaluationService.create(studentId, fullRequest);

        // Then
        assertNotNull(result);
        assertNotNull(result.circumferences());
        assertEquals(30.0, result.circumferences().rightArmRelaxed());
        
        assertNotNull(result.subcutaneousFolds());
        assertEquals(10.0, result.subcutaneousFolds().triceps());
        
        assertNotNull(result.diameters());
        assertEquals(10.0, result.diameters().umerus());
    }
}


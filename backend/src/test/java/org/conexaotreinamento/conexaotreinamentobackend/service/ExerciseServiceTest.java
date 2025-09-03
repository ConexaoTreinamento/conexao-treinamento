package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ExerciseResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Exercise;
import org.conexaotreinamento.conexaotreinamentobackend.repository.ExerciseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ExerciseService Unit Tests")
class ExerciseServiceTest {

    @Mock
    private ExerciseRepository repository;

    @InjectMocks
    private ExerciseService exerciseService;

    private Exercise exercise;
    private UUID exerciseId;
    private ExerciseRequestDTO exerciseRequestDTO;
    private PatchExerciseRequestDTO patchRequestDTO;

    @BeforeEach
    void setUp() {
        exerciseId = UUID.randomUUID();
        exercise = new Exercise("Flexão de Braço", "Exercício para peitoral");

        exerciseRequestDTO = new ExerciseRequestDTO("Flexão de Braço", "Exercício para peitoral");
        patchRequestDTO = new PatchExerciseRequestDTO("Flexão Modificada", null);
    }

    @Test
    @DisplayName("Should create exercise successfully")
    void shouldCreateExerciseSuccessfully() {
        // Given
        when(repository.existsByNameIgnoringCaseAndDeletedAtIsNull("Flexão de Braço")).thenReturn(false);
        when(repository.save(any(Exercise.class))).thenReturn(exercise);

        // When
        ExerciseResponseDTO result = exerciseService.create(exerciseRequestDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Flexão de Braço");
        assertThat(result.description()).isEqualTo("Exercício para peitoral");

        verify(repository).existsByNameIgnoringCaseAndDeletedAtIsNull("Flexão de Braço");
        verify(repository).save(any(Exercise.class));
    }

    @Test
    @DisplayName("Should throw conflict when exercise name already exists")
    void shouldThrowConflictWhenExerciseNameAlreadyExists() {
        // Given
        when(repository.existsByNameIgnoringCaseAndDeletedAtIsNull("Flexão de Braço")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> exerciseService.create(exerciseRequestDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Exercise already exists");

        verify(repository).existsByNameIgnoringCaseAndDeletedAtIsNull("Flexão de Braço");
        verify(repository, never()).save(any(Exercise.class));
    }

    @Test
    @DisplayName("Should find exercise by id successfully")
    void shouldFindExerciseByIdSuccessfully() {
        // Given
        when(repository.findByIdAndDeletedAtIsNull(exerciseId)).thenReturn(Optional.of(exercise));

        // When
        ExerciseResponseDTO result = exerciseService.findById(exerciseId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Flexão de Braço");
        verify(repository).findByIdAndDeletedAtIsNull(exerciseId);
    }

    @Test
    @DisplayName("Should throw not found when exercise does not exist")
    void shouldThrowNotFoundWhenExerciseDoesNotExist() {
        // Given
        when(repository.findByIdAndDeletedAtIsNull(exerciseId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> exerciseService.findById(exerciseId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Exercise not found");

        verify(repository).findByIdAndDeletedAtIsNull(exerciseId);
    }

    @Test
    @DisplayName("Should find all exercises with default pagination")
    void shouldFindAllExercisesWithDefaultPagination() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        List<Exercise> exercises = List.of(exercise);
        Page<Exercise> page = new PageImpl<>(exercises, pageable, 1);

        when(repository.findByDeletedAtIsNull(any(Pageable.class))).thenReturn(page);

        // When
        Page<ExerciseResponseDTO> result = exerciseService.findAll(null, pageable, false);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).name()).isEqualTo("Flexão de Braço");

        verify(repository).findByDeletedAtIsNull(any(Pageable.class));
    }

    @Test
    @DisplayName("Should find exercises by search term")
    void shouldFindExercisesBySearchTerm() {
        // Given
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        List<Exercise> exercises = List.of(exercise);
        Page<Exercise> page = new PageImpl<>(exercises, pageable, 1);

        when(repository.findBySearchTermAndDeletedAtIsNull(eq("%flexão%"), any(Pageable.class))).thenReturn(page);

        // When
        Page<ExerciseResponseDTO> result = exerciseService.findAll("flexão", PageRequest.of(0, 20), false);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(repository).findBySearchTermAndDeletedAtIsNull(eq("%flexão%"), any(Pageable.class));
    }

    @Test
    @DisplayName("Should update exercise successfully")
    void shouldUpdateExerciseSuccessfully() {
        // Given
        ExerciseRequestDTO updateRequest = new ExerciseRequestDTO("Flexão Modificada", "Nova descrição");
        when(repository.findByIdAndDeletedAtIsNull(exerciseId)).thenReturn(Optional.of(exercise));
        when(repository.existsByNameIgnoringCaseAndDeletedAtIsNull("Flexão Modificada")).thenReturn(false);

        // When
        ExerciseResponseDTO result = exerciseService.update(exerciseId, updateRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Flexão Modificada");
        assertThat(result.description()).isEqualTo("Nova descrição");

        verify(repository).findByIdAndDeletedAtIsNull(exerciseId);
        verify(repository).existsByNameIgnoringCaseAndDeletedAtIsNull("Flexão Modificada");
    }

    @Test
    @DisplayName("Should throw conflict when updating to existing name")
    void shouldThrowConflictWhenUpdatingToExistingName() {
        // Given
        ExerciseRequestDTO updateRequest = new ExerciseRequestDTO("Agachamento", "Nova descrição");
        when(repository.findByIdAndDeletedAtIsNull(exerciseId)).thenReturn(Optional.of(exercise));
        when(repository.existsByNameIgnoringCaseAndDeletedAtIsNull("Agachamento")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> exerciseService.update(exerciseId, updateRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Exercise already exists");

        verify(repository).findByIdAndDeletedAtIsNull(exerciseId);
        verify(repository).existsByNameIgnoringCaseAndDeletedAtIsNull("Agachamento");
    }

    @Test
    @DisplayName("Should patch exercise successfully")
    void shouldPatchExerciseSuccessfully() {
        // Given
        when(repository.findByIdAndDeletedAtIsNull(exerciseId)).thenReturn(Optional.of(exercise));
        when(repository.existsByNameIgnoringCaseAndDeletedAtIsNull("Flexão Modificada")).thenReturn(false);

        // When
        ExerciseResponseDTO result = exerciseService.patch(exerciseId, patchRequestDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Flexão Modificada");
        assertThat(result.description()).isEqualTo("Exercício para peitoral"); // Não mudou

        verify(repository).findByIdAndDeletedAtIsNull(exerciseId);
    }

    @Test
    @DisplayName("Should patch exercise with null fields")
    void shouldPatchExerciseWithNullFields() {
        // Given
        PatchExerciseRequestDTO patchWithNulls = new PatchExerciseRequestDTO(null, "Nova descrição");
        when(repository.findByIdAndDeletedAtIsNull(exerciseId)).thenReturn(Optional.of(exercise));

        // When
        ExerciseResponseDTO result = exerciseService.patch(exerciseId, patchWithNulls);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Flexão de Braço"); // Não mudou
        assertThat(result.description()).isEqualTo("Nova descrição");

        verify(repository).findByIdAndDeletedAtIsNull(exerciseId);
        verify(repository, never()).existsByNameIgnoringCaseAndDeletedAtIsNull(any());
    }

    @Test
    @DisplayName("Should delete exercise successfully (soft delete)")
    void shouldDeleteExerciseSuccessfully() {
        // Given
        when(repository.findByIdAndDeletedAtIsNull(exerciseId)).thenReturn(Optional.of(exercise));

        // When
        exerciseService.delete(exerciseId);

        // Then
        assertThat(exercise.getDeletedAt()).isNotNull();
        verify(repository).findByIdAndDeletedAtIsNull(exerciseId);
    }

    @Test
    @DisplayName("Should throw not found when deleting non-existent exercise")
    void shouldThrowNotFoundWhenDeletingNonExistentExercise() {
        // Given
        when(repository.findByIdAndDeletedAtIsNull(exerciseId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> exerciseService.delete(exerciseId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Exercise not found");

        verify(repository).findByIdAndDeletedAtIsNull(exerciseId);
    }

    @Test
    @DisplayName("Should apply default sort when pageable is unsorted")
    void shouldApplyDefaultSortWhenPageableIsUnsorted() {
        // Given
        Pageable unsortedPageable = PageRequest.of(0, 20);
        List<Exercise> exercises = List.of(exercise);
        Page<Exercise> page = new PageImpl<>(exercises, unsortedPageable, 1);

        when(repository.findByDeletedAtIsNull(any(Pageable.class))).thenReturn(page);

        // When
        exerciseService.findAll(null, unsortedPageable, false);

        // Then
        verify(repository).findByDeletedAtIsNull(argThat(pageable -> 
            pageable.getSort().equals(Sort.by("createdAt").descending())
        ));
    }

    @Test
    @DisplayName("Should handle blank search as empty search")
    void shouldHandleBlankSearchAsEmptySearch() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        List<Exercise> exercises = List.of(exercise);
        Page<Exercise> page = new PageImpl<>(exercises, pageable, 1);

        when(repository.findByDeletedAtIsNull(any(Pageable.class))).thenReturn(page);

        // When
        exerciseService.findAll("   ", pageable, false);

        // Then
        verify(repository).findByDeletedAtIsNull(any(Pageable.class));
        verify(repository, never()).findBySearchTermAndDeletedAtIsNull(any(), any());
    }

    @Test
    @DisplayName("Should find all exercises including inactive when includeInactive is true")
    void shouldFindAllExercisesIncludingInactiveWhenIncludeInactiveIsTrue() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        List<Exercise> exercises = List.of(exercise);
        Page<Exercise> page = new PageImpl<>(exercises, pageable, 1);

        when(repository.findAll(any(Pageable.class))).thenReturn(page);

        // When
        Page<ExerciseResponseDTO> result = exerciseService.findAll(null, pageable, true);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(repository).findAll(any(Pageable.class));
        verify(repository, never()).findByDeletedAtIsNull(any());
    }

    @Test
    @DisplayName("Should search exercises including inactive when includeInactive is true")
    void shouldSearchExercisesIncludingInactiveWhenIncludeInactiveIsTrue() {
        // Given
        String searchTerm = "flexão";
        Pageable pageable = PageRequest.of(0, 20);
        List<Exercise> exercises = List.of(exercise);
        Page<Exercise> page = new PageImpl<>(exercises, pageable, 1);

        when(repository.findBySearchTermIncludingInactive(anyString(), any(Pageable.class))).thenReturn(page);

        // When
        Page<ExerciseResponseDTO> result = exerciseService.findAll(searchTerm, pageable, true);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(repository).findBySearchTermIncludingInactive(eq("%" + searchTerm.toLowerCase() + "%"), any(Pageable.class));
        verify(repository, never()).findBySearchTermAndDeletedAtIsNull(any(), any());
    }

    @Test
    @DisplayName("Should restore deleted exercise successfully")
    void shouldRestoreDeletedExerciseSuccessfully() {
        // Given
        UUID exerciseId = UUID.randomUUID();
        Exercise deletedExercise = new Exercise("Push-up", "Basic push-up exercise");
        deletedExercise.deactivate(); // Mark as deleted

        when(repository.findById(exerciseId)).thenReturn(Optional.of(deletedExercise));
        when(repository.existsByNameIgnoringCaseAndDeletedAtIsNull("Push-up")).thenReturn(false);

        // When
        ExerciseResponseDTO result = exerciseService.restore(exerciseId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Push-up");
        assertThat(deletedExercise.isActive()).isTrue(); // Should be active now
        verify(repository).findById(exerciseId);
        verify(repository).existsByNameIgnoringCaseAndDeletedAtIsNull("Push-up");
    }

    @Test
    @DisplayName("Should throw exception when trying to restore non-existent exercise")
    void shouldThrowExceptionWhenTryingToRestoreNonExistentExercise() {
        // Given
        UUID exerciseId = UUID.randomUUID();
        when(repository.findById(exerciseId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> exerciseService.restore(exerciseId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Exercise not found");

        verify(repository).findById(exerciseId);
    }

    @Test
    @DisplayName("Should throw exception when trying to restore already active exercise")
    void shouldThrowExceptionWhenTryingToRestoreAlreadyActiveExercise() {
        // Given
        UUID exerciseId = UUID.randomUUID();
        Exercise activeExercise = new Exercise("Push-up", "Basic push-up exercise");
        // Exercise is active by default (deletedAt = null)

        when(repository.findById(exerciseId)).thenReturn(Optional.of(activeExercise));

        // When & Then
        assertThatThrownBy(() -> exerciseService.restore(exerciseId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Cannot restore exercise.");

        verify(repository).findById(exerciseId);
    }

    @Test
    @DisplayName("Should throw conflict when trying to restore exercise with name that already exists active")
    void shouldThrowConflictWhenTryingToRestoreExerciseWithNameThatAlreadyExistsActive() {
        // Given
        UUID exerciseId = UUID.randomUUID();
        Exercise deletedExercise = new Exercise("Push-up", "Basic push-up exercise");
        deletedExercise.deactivate(); // Mark as deleted

        when(repository.findById(exerciseId)).thenReturn(Optional.of(deletedExercise));
        when(repository.existsByNameIgnoringCaseAndDeletedAtIsNull("Push-up")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> exerciseService.restore(exerciseId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Cannot restore exercise.");

        verify(repository).findById(exerciseId);
        verify(repository).existsByNameIgnoringCaseAndDeletedAtIsNull("Push-up");
    }
}
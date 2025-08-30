package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateTrainerDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ListTrainersDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.entity.enums.CompensationType;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TrainerService Unit Tests")
class TrainerServiceTest {

    @Mock
    private TrainerRepository trainerRepository;

    @Mock
    private UserService userService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private Jwt jwt;

    @InjectMocks
    private TrainerService trainerService;

    private UUID trainerId;
    private UUID userId;
    private Trainer trainer;
    private CreateTrainerDTO createTrainerDTO;
    private ListTrainersDTO listTrainersDTO;

    @BeforeEach
    void setUp() {
        trainerId = UUID.randomUUID();
        userId = UUID.randomUUID();
        
        trainer = new Trainer();
        trainer.setId(trainerId);
        trainer.setName("John Trainer");
        trainer.setEmail("john@example.com");
        trainer.setPhone("+1234567890");
        trainer.setSpecialties(Arrays.asList("Strength Training", "Cardio"));
        trainer.setCompensationType(CompensationType.HOURLY);

        createTrainerDTO = new CreateTrainerDTO(
            "John Trainer",
            "john@example.com",
            "+1234567890",
            "password123",
            Arrays.asList("Strength Training", "Cardio"),
            CompensationType.HOURLY
        );

        listTrainersDTO = new ListTrainersDTO(
            trainerId,
            "John Trainer",
            "john@example.com",
            "+1234567890",
            Arrays.asList("Strength Training", "Cardio"),
            CompensationType.HOURLY,
            true
        );
    }

    @Test
    @DisplayName("Should create trainer successfully")
    void shouldCreateTrainerSuccessfully() {
        // Given
        UUID userId = UUID.randomUUID();
        CreateTrainerDTO request = new CreateTrainerDTO(
            "João Silva",
            "joao@test.com",
            "+5511999999999",
            "password123",
            List.of("Musculação", "Crossfit"),
            CompensationType.HOURLY
        );

        UserResponseDTO userResponse = new UserResponseDTO(userId, "joao@test.com", Role.ROLE_TRAINER);
        
        Trainer savedTrainer = new Trainer();
        savedTrainer.setId(userId);
        savedTrainer.setName("João Silva");
        savedTrainer.setEmail("joao@test.com");
        savedTrainer.setPhone("+5511999999999");
        savedTrainer.setSpecialties(List.of("Musculação", "Crossfit"));
        savedTrainer.setCompensationType(CompensationType.HOURLY);

        when(trainerRepository.existsByEmailIgnoreCaseAndDeletedAtIsNull("joao@test.com")).thenReturn(false);
        when(userService.createUser(any())).thenReturn(userResponse);
        when(trainerRepository.save(any(Trainer.class))).thenReturn(savedTrainer);

        // When
        TrainerResponseDTO result = trainerService.create(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(userId);
        assertThat(result.name()).isEqualTo("João Silva");
        assertThat(result.email()).isEqualTo("joao@test.com");
        assertThat(result.phone()).isEqualTo("+5511999999999");
        assertThat(result.specialties()).containsExactlyInAnyOrder("Musculação", "Crossfit");
        assertThat(result.compensationType()).isEqualTo(CompensationType.HOURLY);

        verify(trainerRepository).existsByEmailIgnoreCaseAndDeletedAtIsNull("joao@test.com");
        verify(userService).createUser(any());
        verify(trainerRepository).save(any(Trainer.class));
    }

    @Test
    @DisplayName("Should throw conflict when trainer email already exists")
    void shouldThrowConflictWhenTrainerEmailAlreadyExists() {
        // Given
        when(trainerRepository.existsByEmailIgnoreCaseAndDeletedAtIsNull("john@example.com")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> trainerService.create(createTrainerDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Trainer with this email already exists")
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);

        verify(trainerRepository).existsByEmailIgnoreCaseAndDeletedAtIsNull("john@example.com");
        verify(userService, never()).createUser(any());
        verify(trainerRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should find trainer by id successfully")
    void shouldFindTrainerByIdSuccessfully() {
        // Given
        when(trainerRepository.findActiveTrainerProfileById(trainerId)).thenReturn(Optional.of(listTrainersDTO));

        // When
        ListTrainersDTO result = trainerService.findById(trainerId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(trainerId);
        assertThat(result.name()).isEqualTo("John Trainer");
        assertThat(result.email()).isEqualTo("john@example.com");
        assertThat(result.active()).isTrue();

        verify(trainerRepository).findActiveTrainerProfileById(trainerId);
    }

    @Test
    @DisplayName("Should throw not found when trainer does not exist")
    void shouldThrowNotFoundWhenTrainerDoesNotExist() {
        // Given
        when(trainerRepository.findActiveTrainerProfileById(trainerId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> trainerService.findById(trainerId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Trainer not found")
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        verify(trainerRepository).findActiveTrainerProfileById(trainerId);
    }

    @Test
    @DisplayName("Should find all trainers successfully")
    void shouldFindAllTrainersSuccessfully() {
        // Given
        List<ListTrainersDTO> trainers = Arrays.asList(listTrainersDTO);
        when(trainerRepository.findAllTrainerProfiles(true)).thenReturn(trainers);

        // When
        List<ListTrainersDTO> result = trainerService.findAll();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("John Trainer");

        verify(trainerRepository).findAllTrainerProfiles(true);
    }

    @Test
    @DisplayName("Should return empty list when no trainers exist")
    void shouldReturnEmptyListWhenNoTrainersExist() {
        // Given
        when(trainerRepository.findAllTrainerProfiles(true)).thenReturn(Arrays.asList());

        // When
        List<ListTrainersDTO> result = trainerService.findAll();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();

        verify(trainerRepository).findAllTrainerProfiles(true);
    }

    @Test
    @DisplayName("Should update trainer successfully")
    void shouldUpdateTrainerSuccessfully() {
        // Given
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(trainerRepository.save(trainer)).thenReturn(trainer);

        // When
        TrainerResponseDTO result = trainerService.put(trainerId, createTrainerDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(trainerId);

        verify(trainerRepository).findById(trainerId);
        verify(trainerRepository).save(trainer);
    }

    @Test
    @DisplayName("Should throw not found when updating non-existent trainer")
    void shouldThrowNotFoundWhenUpdatingNonExistentTrainer() {
        // Given
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> trainerService.put(trainerId, createTrainerDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Trainer not found")
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        verify(trainerRepository).findById(trainerId);
        verify(trainerRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw conflict when updating to existing email")
    void shouldThrowConflictWhenUpdatingToExistingEmail() {
        // Given
        CreateTrainerDTO updateDTO = new CreateTrainerDTO(
            "John Trainer",
            "existing@example.com",
            "+1234567890",
            "password123",
            Arrays.asList("Strength Training"),
            CompensationType.HOURLY
        );
        
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(trainerRepository.existsByEmailIgnoreCaseAndDeletedAtIsNull("existing@example.com")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> trainerService.put(trainerId, updateDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Trainer with this email already exists")
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);

        verify(trainerRepository).findById(trainerId);
        verify(trainerRepository).existsByEmailIgnoreCaseAndDeletedAtIsNull("existing@example.com");
        verify(trainerRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should allow updating trainer with same email")
    void shouldAllowUpdatingTrainerWithSameEmail() {
        // Given
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(trainerRepository.save(trainer)).thenReturn(trainer);

        // When
        TrainerResponseDTO result = trainerService.put(trainerId, createTrainerDTO);

        // Then
        assertThat(result).isNotNull();

        verify(trainerRepository).findById(trainerId);
        verify(trainerRepository, never()).existsByEmailIgnoreCaseAndDeletedAtIsNull(any());
        verify(trainerRepository).save(trainer);
    }

    @Test
    @DisplayName("Should delete trainer successfully")
    void shouldDeleteTrainerSuccessfully() {
        // Given
        doNothing().when(userService).deleteUser(trainerId);

        // When
        trainerService.delete(trainerId);

        // Then
        verify(userService).deleteUser(trainerId);
    }

    @Test
    @DisplayName("Should handle user service exception during delete")
    void shouldHandleUserServiceExceptionDuringDelete() {
        // Given
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"))
                .when(userService).deleteUser(trainerId);

        // When & Then
        assertThatThrownBy(() -> trainerService.delete(trainerId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("User not found");

        verify(userService).deleteUser(trainerId);
    }
}

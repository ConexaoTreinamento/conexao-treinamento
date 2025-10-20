package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateTrainerDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ListTrainersDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
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
    private UserRepository userRepository;

    @InjectMocks
    private TrainerService trainerService;

    private UUID trainerId;
    private UUID userId;
    private Trainer trainer;
    private User user;
    private CreateTrainerDTO createTrainerDTO;
    private ListTrainersDTO listTrainersDTO;

    @BeforeEach
    void setUp() {
        trainerId = UUID.randomUUID();
        userId = UUID.randomUUID();
        
        trainer = new Trainer();
        trainer.setId(trainerId);
        trainer.setUserId(userId);
        trainer.setName("John Trainer");
        trainer.setPhone("+1234567890");
        trainer.setAddress("123 Main St");
        trainer.setBirthDate(LocalDate.of(1990, 1, 1));
        trainer.setSpecialties(Arrays.asList("Strength Training", "Cardio"));
        trainer.setCompensationType(CompensationType.HOURLY);

        user = new User("john@example.com", "password123", Role.ROLE_TRAINER);

        createTrainerDTO = new CreateTrainerDTO(
            "John Trainer",
            "john@example.com",
            "+1234567890",
            "password123",
            "123 Main St",
            LocalDate.of(1990, 1, 1),
            Arrays.asList("Strength Training", "Cardio"),
            CompensationType.HOURLY
        );

        listTrainersDTO = new ListTrainersDTO(
            trainerId,
            "John Trainer",
            "john@example.com",
            "+1234567890",
            "123 Main St",
            LocalDate.of(1990, 1, 1),
            Arrays.asList("Strength Training", "Cardio"),
            CompensationType.HOURLY,
            true,
            Instant.now(),
            120
        );
    }

    @Test
    @DisplayName("Should create trainer successfully")
    void shouldCreateTrainerSuccessfully() {
        // Given
        UUID newUserId = UUID.randomUUID();
        UUID newTrainerId = UUID.randomUUID();
        CreateTrainerDTO request = new CreateTrainerDTO(
            "João Silva",
            "joao@test.com",
            "+5511999999999",
            "password123",
            "Rua das Flores, 123",
            LocalDate.of(1985, 3, 20),
            List.of("Musculação", "Crossfit"),
            CompensationType.HOURLY
        );

        UserResponseDTO userResponse = new UserResponseDTO(newUserId, "joao@test.com", Role.ROLE_TRAINER);
        
        Trainer savedTrainer = new Trainer();
        savedTrainer.setId(newTrainerId);
        savedTrainer.setUserId(newUserId);
        savedTrainer.setName("João Silva");
        savedTrainer.setPhone("+5511999999999");
        savedTrainer.setAddress("Rua das Flores, 123");
        savedTrainer.setBirthDate(LocalDate.of(1985, 3, 20));
        savedTrainer.setSpecialties(List.of("Musculação", "Crossfit"));
        savedTrainer.setCompensationType(CompensationType.HOURLY);

        User savedUser = new User("joao@test.com", "password123", Role.ROLE_TRAINER);

        ListTrainersDTO expectedResult = new ListTrainersDTO(
            newTrainerId,
            "João Silva",
            "joao@test.com",
            "+5511999999999",
            "Rua das Flores, 123",
            LocalDate.of(1985, 3, 20),
            List.of("Musculação", "Crossfit"),
            CompensationType.HOURLY,
            true,
            Instant.now(),
            120
        );

        when(trainerRepository.existsByEmailIgnoreCase("joao@test.com")).thenReturn(false);
        when(userService.createUser(any())).thenReturn(userResponse);
        when(trainerRepository.save(any(Trainer.class))).thenReturn(savedTrainer);
        when(trainerRepository.findActiveTrainerProfileById(newTrainerId)).thenReturn(Optional.of(expectedResult));

        // When
        ListTrainersDTO result = trainerService.create(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(newTrainerId);
        assertThat(result.name()).isEqualTo("João Silva");
        assertThat(result.email()).isEqualTo("joao@test.com");
        assertThat(result.phone()).isEqualTo("+5511999999999");
        assertThat(result.address()).isEqualTo("Rua das Flores, 123");
        assertThat(result.birthDate()).isEqualTo(LocalDate.of(1985, 3, 20));
        assertThat(result.specialties()).containsExactlyInAnyOrder("Musculação", "Crossfit");
        assertThat(result.compensationType()).isEqualTo(CompensationType.HOURLY);
        assertThat(result.active()).isTrue();
        assertThat(result.joinDate()).isNotNull();
        assertThat(result.hoursWorked()).isEqualTo(120);

        verify(trainerRepository).existsByEmailIgnoreCase("joao@test.com");
        verify(userService).createUser(any());
        verify(trainerRepository).save(any(Trainer.class));
        verify(trainerRepository).findActiveTrainerProfileById(newTrainerId);
    }

    @Test
    @DisplayName("Should throw conflict when user email already exists")
    void shouldThrowConflictWhenUserEmailAlreadyExists() {
        // Given
        when(userService.createUser(any())).thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "User with this email already exists"));

        // When & Then
        assertThatThrownBy(() -> trainerService.create(createTrainerDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("User with this email already exists")
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);

        verify(userService).createUser(any());
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
    @DisplayName("Should update trainer successfully with password")
    void shouldUpdateTrainerSuccessfullyWithPassword() {
        // Given
        CreateTrainerDTO updateTrainerDTO = new CreateTrainerDTO(
                "John Trainer",
                "john@example.com",
                "+1234567890",
                "newpassword123",
                "123 Main St",
                LocalDate.of(1990, 1, 1),
                Arrays.asList("Strength Training", "Cardio"),
                CompensationType.HOURLY);

        UserResponseDTO updatedUserResponse = new UserResponseDTO(userId, "john@example.com", Role.ROLE_TRAINER);

        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(userService.updateUserEmail(userId, "john@example.com")).thenReturn(updatedUserResponse);
        when(userService.resetUserPassword(userId, "newpassword123")).thenReturn(updatedUserResponse);
        when(trainerRepository.save(trainer)).thenReturn(trainer);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // When
        TrainerResponseDTO result = trainerService.put(trainerId, updateTrainerDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(trainerId);
        assertThat(result.email()).isEqualTo("john@example.com");
        assertThat(result.address()).isEqualTo("123 Main St");
        assertThat(result.birthDate()).isEqualTo(LocalDate.of(1990, 1, 1));

        verify(trainerRepository).findById(trainerId);
        verify(userService).updateUserEmail(userId, "john@example.com");
        verify(userService).resetUserPassword(userId, "newpassword123");
        verify(trainerRepository).save(trainer);
        verify(userRepository).findById(userId);
    }

    @Test
    @DisplayName("Should update trainer successfully without password")
    void shouldUpdateTrainerSuccessfullyWithoutPassword() {
        // Given
        CreateTrainerDTO updateTrainerDTO = new CreateTrainerDTO(
                "John Trainer Updated",
                "john.updated@example.com",
                "+1234567890",
                null, // No password provided
                "456 New St",
                LocalDate.of(1990, 1, 1),
                Arrays.asList("Strength Training", "Yoga"),
                CompensationType.MONTHLY);

        UserResponseDTO updatedUserResponse = new UserResponseDTO(userId, "john.updated@example.com",
                Role.ROLE_TRAINER);

        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(userService.updateUserEmail(userId, "john.updated@example.com")).thenReturn(updatedUserResponse);
        when(trainerRepository.save(trainer)).thenReturn(trainer);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // When
        TrainerResponseDTO result = trainerService.put(trainerId, updateTrainerDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(trainerId);
        assertThat(result.email()).isEqualTo("john.updated@example.com");
        assertThat(result.address()).isEqualTo("456 New St");
        assertThat(result.birthDate()).isEqualTo(LocalDate.of(1990, 1, 1));

        verify(trainerRepository).findById(trainerId);
        verify(userService).updateUserEmail(userId, "john.updated@example.com");
        verify(userService, never()).resetUserPassword(any(), any());
        verify(trainerRepository).save(trainer);
        verify(userRepository).findById(userId);
    }

    @Test
    @DisplayName("Should throw not found when updating non-existent trainer")
    void shouldThrowNotFoundWhenUpdatingNonExistentTrainer() {
        // Given
        CreateTrainerDTO updateTrainerDTO = new CreateTrainerDTO(
            "John Trainer",
            "john@example.com",
            "+1234567890",
            "password123",
            "123 Main St",
            LocalDate.of(1990, 1, 1),
            Arrays.asList("Strength Training", "Cardio"),
            CompensationType.HOURLY
        );
        
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> trainerService.put(trainerId, updateTrainerDTO))
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
            "123 Main St",
            LocalDate.of(1990, 1, 1),
            Arrays.asList("Strength Training"),
            CompensationType.HOURLY
        );
        
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(userService.updateUserEmail(userId, "existing@example.com"))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use"));

        // When & Then
        assertThatThrownBy(() -> trainerService.put(trainerId, updateDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Email already in use")
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);

        verify(trainerRepository).findById(trainerId);
        verify(userService).updateUserEmail(userId, "existing@example.com");
        verify(trainerRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should allow updating trainer with same email")
    void shouldAllowUpdatingTrainerWithSameEmail() {
        // Given
        CreateTrainerDTO updateTrainerDTO = new CreateTrainerDTO(
                "John Trainer",
                "john@example.com",
                "+1234567890",
                "password123",
                "123 Main St",
                LocalDate.of(1990, 1, 1),
                Arrays.asList("Strength Training", "Cardio"),
                CompensationType.HOURLY);

        UserResponseDTO updatedUserResponse = new UserResponseDTO(userId, "john@example.com", Role.ROLE_TRAINER);

        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(userService.updateUserEmail(userId, "john@example.com")).thenReturn(updatedUserResponse);
        when(userService.resetUserPassword(userId, "password123")).thenReturn(updatedUserResponse);
        when(trainerRepository.save(trainer)).thenReturn(trainer);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // When
        TrainerResponseDTO result = trainerService.put(trainerId, updateTrainerDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo("john@example.com");

        verify(trainerRepository).findById(trainerId);
        verify(userService).updateUserEmail(userId, "john@example.com");
        verify(userService).resetUserPassword(userId, "password123");
        verify(trainerRepository).save(trainer);
        verify(userRepository).findById(userId);
    }

    @Test
    @DisplayName("Should delete trainer successfully")
    void shouldDeleteTrainerSuccessfully() {
        // Given
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        doNothing().when(userService).delete(userId);

        // When
        trainerService.delete(trainerId);

        // Then
        verify(trainerRepository).findById(trainerId);
        verify(userService).delete(userId);
    }

    @Test
    @DisplayName("Should handle user service exception during delete")
    void shouldHandleUserServiceExceptionDuringDelete() {
        // Given
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"))
                .when(userService).delete(userId);

        // When & Then
        assertThatThrownBy(() -> trainerService.delete(trainerId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("User not found");

        verify(trainerRepository).findById(trainerId);
        verify(userService).delete(userId);
    }
}

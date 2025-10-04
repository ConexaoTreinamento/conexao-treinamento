package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateAdministratorDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ListAdministratorsDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AdministratorRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdministratorService Unit Tests")
class AdministratorServiceTest {

    @Mock
    private AdministratorRepository administratorRepository;

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdministratorService administratorService;

    private UUID administratorId;
    private UUID userId;
    private Administrator administrator;
    private User user;
    private CreateAdministratorDTO createAdministratorDTO;
    private ListAdministratorsDTO listAdministratorsDTO;

    @BeforeEach
    void setUp() {
        administratorId = UUID.randomUUID();
        userId = UUID.randomUUID();
        
        administrator = new Administrator();
        administrator.setId(administratorId);
        administrator.setUserId(userId);
        administrator.setFirstName("João");
        administrator.setLastName("Silva");

        user = new User("joao@example.com", "password123", Role.ROLE_ADMIN);

        createAdministratorDTO = new CreateAdministratorDTO(
            "João",
            "Silva", 
            "joao@example.com",
            "password123"
        );

        listAdministratorsDTO = new ListAdministratorsDTO(
            administratorId,
            "João",
            "Silva",
            "joao@example.com",
            "João Silva",
            true,
            Instant.now()
        );
    }

    @Test
    @DisplayName("Should create administrator successfully")
    void shouldCreateAdministratorSuccessfully() {
        // Given
        UUID newUserId = UUID.randomUUID();
        UUID newAdministratorId = UUID.randomUUID();
        CreateAdministratorDTO request = new CreateAdministratorDTO(
            "João Silva",
            "Santos",
            "joao@test.com",
            "password123"
        );

        UserResponseDTO userResponse = new UserResponseDTO(newUserId, "joao@test.com", Role.ROLE_ADMIN);
        
        Administrator savedAdministrator = new Administrator();
        savedAdministrator.setId(newAdministratorId);
        savedAdministrator.setUserId(newUserId);
        savedAdministrator.setFirstName("João Silva");
        savedAdministrator.setLastName("Santos");

        ListAdministratorsDTO expectedResult = new ListAdministratorsDTO(
            newAdministratorId,
            "João Silva",
            "Santos",
            "joao@test.com",
            "João Silva Santos",
            true,
            Instant.now()
        );

        when(administratorRepository.existsByEmailIgnoreCase("joao@test.com")).thenReturn(false);
        when(userService.createUser(any())).thenReturn(userResponse);
        when(administratorRepository.save(any(Administrator.class))).thenReturn(savedAdministrator);
        when(administratorRepository.findActiveAdministratorProfileById(newAdministratorId)).thenReturn(Optional.of(expectedResult));

        // When
        ListAdministratorsDTO result = administratorService.create(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(newAdministratorId);
        assertThat(result.firstName()).isEqualTo("João Silva");
        assertThat(result.lastName()).isEqualTo("Santos");
        assertThat(result.email()).isEqualTo("joao@test.com");
        assertThat(result.fullName()).isEqualTo("João Silva Santos");
        assertThat(result.active()).isTrue();
        assertThat(result.joinDate()).isNotNull();

        verify(administratorRepository).existsByEmailIgnoreCase("joao@test.com");
        verify(userService).createUser(any());
        verify(administratorRepository).save(any(Administrator.class));
        verify(administratorRepository).findActiveAdministratorProfileById(newAdministratorId);
    }

    @Test
    @DisplayName("Should throw conflict when user email already exists")
    void shouldThrowConflictWhenUserEmailAlreadyExists() {
        // Given
        when(userService.createUser(any())).thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "User with this email already exists"));

        // When & Then
        assertThatThrownBy(() -> administratorService.create(createAdministratorDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("User with this email already exists")
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);

        verify(userService).createUser(any());
        verify(administratorRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should find administrator by id successfully")
    void shouldFindAdministratorByIdSuccessfully() {
        // Given
        when(administratorRepository.findActiveAdministratorProfileById(administratorId)).thenReturn(Optional.of(listAdministratorsDTO));

        // When
        ListAdministratorsDTO result = administratorService.findById(administratorId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(administratorId);
        assertThat(result.firstName()).isEqualTo("João");
        assertThat(result.lastName()).isEqualTo("Silva");
        assertThat(result.email()).isEqualTo("joao@example.com");
        assertThat(result.active()).isTrue();

        verify(administratorRepository).findActiveAdministratorProfileById(administratorId);
    }

    @Test
    @DisplayName("Should throw not found when administrator does not exist")
    void shouldThrowNotFoundWhenAdministratorDoesNotExist() {
        // Given
        when(administratorRepository.findActiveAdministratorProfileById(administratorId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> administratorService.findById(administratorId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Administrator not found")
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        verify(administratorRepository).findActiveAdministratorProfileById(administratorId);
    }

    @Test
    @DisplayName("Should find all administrators successfully")
    void shouldFindAllAdministratorsSuccessfully() {
        // Given
        List<ListAdministratorsDTO> administrators = List.of(listAdministratorsDTO);
        when(administratorRepository.findAllAdministratorProfiles(true)).thenReturn(administrators);

        // When
        List<ListAdministratorsDTO> result = administratorService.findAll();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).firstName()).isEqualTo("João");

        verify(administratorRepository).findAllAdministratorProfiles(true);
    }

    @Test
    @DisplayName("Should return empty list when no administrators exist")
    void shouldReturnEmptyListWhenNoAdministratorsExist() {
        // Given
        when(administratorRepository.findAllAdministratorProfiles(true)).thenReturn(List.of());

        // When
        List<ListAdministratorsDTO> result = administratorService.findAll();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();

        verify(administratorRepository).findAllAdministratorProfiles(true);
    }

    @Test
    @DisplayName("Should update administrator successfully with password")
    void shouldUpdateAdministratorSuccessfullyWithPassword() {
        // Given
        CreateAdministratorDTO updateAdministratorDTO = new CreateAdministratorDTO(
            "João Updated",
            "Silva Updated",
            "joao@example.com",
            "newpassword123"
        );
        
        UserResponseDTO updatedUserResponse = new UserResponseDTO(userId, "joao@example.com", Role.ROLE_ADMIN);
        
        when(administratorRepository.findById(administratorId)).thenReturn(Optional.of(administrator));
        when(userService.updateUserEmail(userId, "joao@example.com")).thenReturn(updatedUserResponse);
        when(userService.updateUserPassword(userId, "newpassword123")).thenReturn(updatedUserResponse);
        when(administratorRepository.save(administrator)).thenReturn(administrator);
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.of(user));

        // When
        AdministratorResponseDTO result = administratorService.put(administratorId, updateAdministratorDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(administratorId);
        assertThat(result.email()).isEqualTo("joao@example.com");

        verify(administratorRepository).findById(administratorId);
        verify(userService).updateUserEmail(userId, "joao@example.com");
        verify(userService).updateUserPassword(userId, "newpassword123");
        verify(administratorRepository).save(administrator);
        verify(userRepository).findByIdAndDeletedAtIsNull(userId);
    }

    @Test
    @DisplayName("Should update administrator successfully without password")
    void shouldUpdateAdministratorSuccessfullyWithoutPassword() {
        // Given
        CreateAdministratorDTO updateAdministratorDTO = new CreateAdministratorDTO(
            "João Updated",
            "Silva Updated",
            "joao.updated@example.com",
            null // No password provided
        );
        
        UserResponseDTO updatedUserResponse = new UserResponseDTO(userId, "joao.updated@example.com", Role.ROLE_ADMIN);
        
        when(administratorRepository.findById(administratorId)).thenReturn(Optional.of(administrator));
        when(userService.updateUserEmail(userId, "joao.updated@example.com")).thenReturn(updatedUserResponse);
        when(administratorRepository.save(administrator)).thenReturn(administrator);
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.of(user));

        // When
        AdministratorResponseDTO result = administratorService.put(administratorId, updateAdministratorDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(administratorId);
        assertThat(result.email()).isEqualTo("joao.updated@example.com");

        verify(administratorRepository).findById(administratorId);
        verify(userService).updateUserEmail(userId, "joao.updated@example.com");
        verify(userService, never()).updateUserPassword(any(), any());
        verify(administratorRepository).save(administrator);
        verify(userRepository).findByIdAndDeletedAtIsNull(userId);
    }

    @Test
    @DisplayName("Should delete administrator successfully")
    void shouldDeleteAdministratorSuccessfully() {
        // Given
        when(administratorRepository.findById(administratorId)).thenReturn(Optional.of(administrator));
        doNothing().when(userService).delete(userId);

        // When
        administratorService.delete(administratorId);

        // Then
        verify(administratorRepository).findById(administratorId);
        verify(userService).delete(userId);
    }
}
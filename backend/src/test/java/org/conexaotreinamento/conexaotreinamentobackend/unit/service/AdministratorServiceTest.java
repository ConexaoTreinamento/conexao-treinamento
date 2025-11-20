package org.conexaotreinamento.conexaotreinamentobackend.unit.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AdministratorCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AdministratorRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.AdministratorService;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import org.mockito.junit.jupiter.MockitoExtension;

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
    private AdministratorCreateRequestDTO createAdministratorDTO;
    private AdministratorListItemResponseDTO listAdministratorsDTO;

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

        createAdministratorDTO = new AdministratorCreateRequestDTO(
            "João",
            "Silva", 
            "joao@example.com",
            "password123"
        );

        listAdministratorsDTO = new AdministratorListItemResponseDTO(
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
        AdministratorCreateRequestDTO request = new AdministratorCreateRequestDTO(
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

        AdministratorListItemResponseDTO expectedResult = new AdministratorListItemResponseDTO(
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
        AdministratorListItemResponseDTO result = administratorService.create(request);

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
        AdministratorListItemResponseDTO result = administratorService.findById(administratorId);

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
        List<AdministratorListItemResponseDTO> administrators = List.of(listAdministratorsDTO);
        when(administratorRepository.findAllAdministratorProfiles(true)).thenReturn(administrators);

        // When
        List<AdministratorListItemResponseDTO> result = administratorService.findAll();

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
        List<AdministratorListItemResponseDTO> result = administratorService.findAll();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();

        verify(administratorRepository).findAllAdministratorProfiles(true);
    }

    @Test
    @DisplayName("Should find all administrators with pagination and search successfully")
    void shouldFindAllAdministratorsWithPaginationAndSearchSuccessfully() {
        // Given
        String searchTerm = "João";
        Pageable pageable = PageRequest.of(0, 10);
        List<AdministratorListItemResponseDTO> searchResults = List.of(listAdministratorsDTO);
        
        when(administratorRepository.findBySearchTermAndActive("%joão%")).thenReturn(searchResults);

        // When
        Page<AdministratorListItemResponseDTO> result = administratorService.findAll(searchTerm, pageable, false);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).firstName()).isEqualTo("João");

        verify(administratorRepository).findBySearchTermAndActive("%joão%");
    }

    @Test
    @DisplayName("Should find all administrators with pagination and search including inactive successfully")
    void shouldFindAllAdministratorsWithPaginationAndSearchIncludingInactiveSuccessfully() {
        // Given
        String searchTerm = "João";
        Pageable pageable = PageRequest.of(0, 10);
        List<AdministratorListItemResponseDTO> searchResults = List.of(listAdministratorsDTO);
        
        when(administratorRepository.findBySearchTermIncludingInactive("%joão%")).thenReturn(searchResults);

        // When
        Page<AdministratorListItemResponseDTO> result = administratorService.findAll(searchTerm, pageable, true);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).firstName()).isEqualTo("João");

        verify(administratorRepository).findBySearchTermIncludingInactive("%joão%");
    }

    @Test
    @DisplayName("Should find all administrators with pagination no search active only successfully")
    void shouldFindAllAdministratorsWithPaginationNoSearchActiveOnlySuccessfully() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<AdministratorListItemResponseDTO> pageResult = new org.springframework.data.domain.PageImpl<>(List.of(listAdministratorsDTO));
        
        when(administratorRepository.findActiveAdministratorsPage(any(Pageable.class))).thenReturn(pageResult);

        // When
        Page<AdministratorListItemResponseDTO> result = administratorService.findAll(null, pageable, false);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).firstName()).isEqualTo("João");

        verify(administratorRepository).findActiveAdministratorsPage(any(Pageable.class));
    }

    @Test
    @DisplayName("Should find all administrators with pagination no search including inactive successfully")
    void shouldFindAllAdministratorsWithPaginationNoSearchIncludingInactiveSuccessfully() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<AdministratorListItemResponseDTO> pageResult = new org.springframework.data.domain.PageImpl<>(List.of(listAdministratorsDTO));
        
        when(administratorRepository.findAllAdministratorsPage(any(Pageable.class))).thenReturn(pageResult);

        // When
        Page<AdministratorListItemResponseDTO> result = administratorService.findAll("", pageable, true);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).firstName()).isEqualTo("João");

        verify(administratorRepository).findAllAdministratorsPage(any(Pageable.class));
    }

    @Test
    @DisplayName("Should update administrator successfully with password")
    void shouldUpdateAdministratorSuccessfullyWithPassword() {
        // Given
        AdministratorCreateRequestDTO updateAdministratorDTO = new AdministratorCreateRequestDTO(
                "João Updated",
                "Silva Updated",
                "joao@example.com",
                "newpassword123");

        UserResponseDTO updatedUserResponse = new UserResponseDTO(userId, "joao@example.com", Role.ROLE_ADMIN);

        when(administratorRepository.findById(administratorId)).thenReturn(Optional.of(administrator));
        when(userService.updateUserEmail(userId, "joao@example.com")).thenReturn(updatedUserResponse);
        when(userService.resetUserPassword(userId, "newpassword123")).thenReturn(updatedUserResponse);
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
        verify(userService).resetUserPassword(userId, "newpassword123");
        verify(administratorRepository).save(administrator);
        verify(userRepository).findByIdAndDeletedAtIsNull(userId);
    }

    @Test
    @DisplayName("Should update administrator successfully without password")
    void shouldUpdateAdministratorSuccessfullyWithoutPassword() {
        // Given
        AdministratorCreateRequestDTO updateAdministratorDTO = new AdministratorCreateRequestDTO(
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
        verify(userService, never()).resetUserPassword(any(), any());
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

    @Test
    @DisplayName("Should restore administrator successfully")
    void shouldRestoreAdministratorSuccessfully() {
        // Given
        user.deactivate(); // Mark user as inactive
        UserResponseDTO restoredUserResponse = new UserResponseDTO(userId, "joao@example.com", Role.ROLE_ADMIN);
        
        // Create a restored (active) user
        User restoredUser = new User("joao@example.com", "password123", Role.ROLE_ADMIN);
        
        when(administratorRepository.findById(administratorId)).thenReturn(Optional.of(administrator));
        when(userService.restore(userId)).thenReturn(restoredUserResponse);
        when(userRepository.findById(userId)).thenReturn(Optional.of(restoredUser));

        // When
        AdministratorResponseDTO result = administratorService.restore(administratorId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(administratorId);
        assertThat(result.email()).isEqualTo("joao@example.com");
        assertThat(result.active()).isTrue();
        
        verify(administratorRepository).findById(administratorId);
        verify(userService).restore(userId);
        verify(userRepository).findById(userId);
    }

    @Test
    @DisplayName("Should throw not found when trying to restore non-existent administrator")
    void shouldThrowNotFoundWhenTryingToRestoreNonExistentAdministrator() {
        // Given
        when(administratorRepository.findById(administratorId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> administratorService.restore(administratorId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Administrator not found")
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
        
        verify(administratorRepository).findById(administratorId);
        verify(userService, never()).restore(any());
    }

    @Test
    @DisplayName("Should throw conflict when trying to restore already active administrator")
    void shouldThrowConflictWhenTryingToRestoreAlreadyActiveAdministrator() {
        // Given
        when(administratorRepository.findById(administratorId)).thenReturn(Optional.of(administrator));
        when(userService.restore(userId)).thenThrow(
            new ResponseStatusException(HttpStatus.CONFLICT, "User is already active")
        );

        // When & Then
        assertThatThrownBy(() -> administratorService.restore(administratorId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("User is already active")
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);
        
        verify(administratorRepository).findById(administratorId);
        verify(userService).restore(userId);
    }

    @Test
    @DisplayName("Should throw conflict when restoring administrator with email conflict")
    void shouldThrowConflictWhenRestoringAdministratorWithEmailConflict() {
        // Given
        when(administratorRepository.findById(administratorId)).thenReturn(Optional.of(administrator));
        when(userService.restore(userId)).thenThrow(
            new ResponseStatusException(HttpStatus.CONFLICT, "Cannot restore user due to email conflict with another active user")
        );

        // When & Then
        assertThatThrownBy(() -> administratorService.restore(administratorId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Cannot restore user due to email conflict")
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);
        
        verify(administratorRepository).findById(administratorId);
        verify(userService).restore(userId);
    }

    @Test
    @DisplayName("Should patch administrator successfully")
    void shouldPatchAdministratorSuccessfully() {
        // Given
        PatchAdministratorRequestDTO patchRequest = new PatchAdministratorRequestDTO(
            "João Patched",
            "Silva Patched",
            "joao.patched@example.com"
        );
        
        UserResponseDTO updatedUserResponse = new UserResponseDTO(userId, "joao.patched@example.com", Role.ROLE_ADMIN);
        
        User updatedUser = new User("joao.patched@example.com", "password123", Role.ROLE_ADMIN);
        
        when(administratorRepository.findById(administratorId)).thenReturn(Optional.of(administrator));
        when(userRepository.findByIdAndDeletedAtIsNull(userId))
            .thenReturn(Optional.of(user)) // First call
            .thenReturn(Optional.of(updatedUser)); // Second call after update
            
        when(userService.updateUserEmail(userId, "joao.patched@example.com")).thenReturn(updatedUserResponse);
        when(administratorRepository.save(administrator)).thenReturn(administrator);
        
        // When
        AdministratorResponseDTO result = administratorService.patch(administratorId, patchRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(administratorId);
        assertThat(result.email()).isEqualTo("joao.patched@example.com");
        assertThat(administrator.getFirstName()).isEqualTo("João Patched");
        assertThat(administrator.getLastName()).isEqualTo("Silva Patched");

        verify(administratorRepository).findById(administratorId);
        verify(userService).updateUserEmail(userId, "joao.patched@example.com");
        verify(administratorRepository).save(administrator);
    }

    @Test
    @DisplayName("Should patch administrator partial successfully")
    void shouldPatchAdministratorPartialSuccessfully() {
        // Given
        PatchAdministratorRequestDTO patchRequest = new PatchAdministratorRequestDTO(
            "João Patched",
            null,
            null
        );
        
        when(administratorRepository.findById(administratorId)).thenReturn(Optional.of(administrator));
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.of(user));
        when(administratorRepository.save(administrator)).thenReturn(administrator);
        
        // When
        AdministratorResponseDTO result = administratorService.patch(administratorId, patchRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(administratorId);
        assertThat(administrator.getFirstName()).isEqualTo("João Patched");
        assertThat(administrator.getLastName()).isEqualTo("Silva"); // Unchanged

        verify(administratorRepository).findById(administratorId);
        verify(userService, never()).updateUserEmail(any(), any());
        verify(administratorRepository).save(administrator);
    }

    @Test
    @DisplayName("Should find administrator by user id successfully")
    void shouldFindAdministratorByUserIdSuccessfully() {
        // Given
        when(administratorRepository.findActiveAdministratorByUserId(userId)).thenReturn(Optional.of(listAdministratorsDTO));

        // When
        AdministratorListItemResponseDTO result = administratorService.findByUserId(userId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(administratorId);
        
        verify(administratorRepository).findActiveAdministratorByUserId(userId);
    }

    @Test
    @DisplayName("Should throw not found when administrator by user id does not exist")
    void shouldThrowNotFoundWhenAdministratorByUserIdDoesNotExist() {
        // Given
        when(administratorRepository.findActiveAdministratorByUserId(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> administratorService.findByUserId(userId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Administrator not found")
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
        
        verify(administratorRepository).findActiveAdministratorByUserId(userId);
    }

    @Test
    @DisplayName("Should find all administrators with pagination and sort successfully")
    void shouldFindAllAdministratorsWithPaginationAndSortSuccessfully() {
        // Given
        Pageable pageable = PageRequest.of(0, 10, Sort.by("firstName").ascending());
        Page<AdministratorListItemResponseDTO> pageResult = new org.springframework.data.domain.PageImpl<>(List.of(listAdministratorsDTO));
        
        when(administratorRepository.findActiveAdministratorsPage(any(Pageable.class))).thenReturn(pageResult);

        // When
        Page<AdministratorListItemResponseDTO> result = administratorService.findAll(null, pageable, false);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(administratorRepository).findActiveAdministratorsPage(pageable);
    }

    @Test
    @DisplayName("Should return empty page when pagination out of bounds")
    void shouldReturnEmptyPageWhenPaginationOutOfBounds() {
        // Given
        String searchTerm = "João";
        Pageable pageable = PageRequest.of(10, 10); // Page 10, but only 1 result
        List<AdministratorListItemResponseDTO> searchResults = List.of(listAdministratorsDTO);
        
        when(administratorRepository.findBySearchTermAndActive("%joão%")).thenReturn(searchResults);

        // When
        Page<AdministratorListItemResponseDTO> result = administratorService.findAll(searchTerm, pageable, false);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
        verify(administratorRepository).findBySearchTermAndActive("%joão%");
    }

    @Test
    void shouldThrowNotFoundWhenPatchingNonExistentAdministrator() {
        UUID adminId = UUID.randomUUID();
        PatchAdministratorRequestDTO request = new PatchAdministratorRequestDTO("email@example.com", "First", "Last");
        
        when(administratorRepository.findById(adminId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> administratorService.patch(adminId, request))
            .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void shouldFindAllAdministratorsWithSearchTerm() {
        String searchTerm = "John";
        Pageable pageable = PageRequest.of(0, 10);
        
        AdministratorListItemResponseDTO admin1 = new AdministratorListItemResponseDTO(UUID.randomUUID(), "John", "Doe", "john@example.com", "John Doe", true, Instant.now());
        
        when(administratorRepository.findBySearchTermAndActive("%john%")).thenReturn(List.of(admin1));

        Page<AdministratorListItemResponseDTO> result = administratorService.findAll(searchTerm, pageable, false);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).fullName()).isEqualTo("John Doe");
    }

    @Test
    void shouldFindAllAdministratorsWithSearchTermIncludingInactive() {
        String searchTerm = "John";
        Pageable pageable = PageRequest.of(0, 10);
        
        AdministratorListItemResponseDTO admin1 = new AdministratorListItemResponseDTO(UUID.randomUUID(), "John", "Doe", "john@example.com", "John Doe", false, Instant.now());
        
        when(administratorRepository.findBySearchTermIncludingInactive("%john%")).thenReturn(List.of(admin1));

        Page<AdministratorListItemResponseDTO> result = administratorService.findAll(searchTerm, pageable, true);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).active()).isFalse();
    }

    @Test
    void shouldThrowExceptionWhenCreatedAdministratorNotFound() {
        // Given
        AdministratorCreateRequestDTO request = new AdministratorCreateRequestDTO(
            "John", "Doe", "john@example.com", "password123"
        );
        
        UserResponseDTO userResponseDTO = new UserResponseDTO(
            UUID.randomUUID(), "john@example.com", Role.ROLE_ADMIN
        );

        when(administratorRepository.existsByEmailIgnoreCase(request.email())).thenReturn(false);
        when(userService.createUser(any())).thenReturn(userResponseDTO);
        when(administratorRepository.save(any(Administrator.class))).thenAnswer(invocation -> {
            Administrator admin = invocation.getArgument(0);
            return admin; 
        });
        when(administratorRepository.findActiveAdministratorProfileById(any())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> administratorService.create(request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Created administrator not found");
    }

    @Test
    void shouldThrowExceptionWhenUpdatingAdministratorNotFound() {
        // Given
        UUID id = UUID.randomUUID();
        AdministratorCreateRequestDTO request = new AdministratorCreateRequestDTO(
            "John", "Doe", "john@example.com", "password123"
        );

        when(administratorRepository.findById(id)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> administratorService.put(id, request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Administrator not found");
    }

    @Test
    void shouldThrowExceptionWhenUpdatingAdministratorUserNotFound() {
        // Given
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        AdministratorCreateRequestDTO request = new AdministratorCreateRequestDTO(
            "John", "Doe", "john@example.com", "password123"
        );
        
        Administrator administrator = new Administrator();
        administrator.setUserId(userId);

        when(administratorRepository.findById(id)).thenReturn(Optional.of(administrator));
        when(userService.updateUserEmail(any(), any())).thenReturn(new UserResponseDTO(userId, "email", Role.ROLE_ADMIN));
        when(administratorRepository.save(any())).thenReturn(administrator);
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> administratorService.put(id, request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("User not found");
    }

    @Test
    void shouldThrowExceptionWhenPatchingAdministratorNotFound() {
        // Given
        UUID id = UUID.randomUUID();
        PatchAdministratorRequestDTO request = new PatchAdministratorRequestDTO(
            "John", "Doe", "john@example.com"
        );

        when(administratorRepository.findById(id)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> administratorService.patch(id, request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Administrator not found");
    }

    @Test
    void shouldThrowExceptionWhenPatchingAdministratorUserNotFound() {
        // Given
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        PatchAdministratorRequestDTO request = new PatchAdministratorRequestDTO(
            "John", "Doe", "john@example.com"
        );
        
        Administrator administrator = new Administrator();
        administrator.setUserId(userId);

        when(administratorRepository.findById(id)).thenReturn(Optional.of(administrator));
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> administratorService.patch(id, request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("User not found");
    }

    @Test
    void shouldThrowExceptionWhenRestoringAdministratorNotFound() {
        // Given
        UUID id = UUID.randomUUID();

        when(administratorRepository.findById(id)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> administratorService.restore(id))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Administrator not found");
    }

    @Test
    void shouldThrowExceptionWhenRestoringAdministratorUserNotFound() {
        // Given
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        
        Administrator administrator = new Administrator();
        administrator.setUserId(userId);

        when(administratorRepository.findById(id)).thenReturn(Optional.of(administrator));
        when(userService.restore(userId)).thenReturn(new UserResponseDTO(userId, "email", Role.ROLE_ADMIN));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> administratorService.restore(id))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("User not found");
    }

    @Test
    void shouldThrowExceptionWhenCreatingAdministratorWithExistingEmail() {
        // Given
        AdministratorCreateRequestDTO request = new AdministratorCreateRequestDTO(
            "John", "Doe", "john@example.com", "password123"
        );

        when(administratorRepository.existsByEmailIgnoreCase(request.email())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> administratorService.create(request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Administrator with this email already exists");
    }

    @Test
    void shouldThrowExceptionWhenPatchingAdministratorUserNotFoundAfterUpdate() {
        // Given
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        PatchAdministratorRequestDTO request = new PatchAdministratorRequestDTO(
            "John", "Doe", "newemail@example.com"
        );
        
        Administrator administrator = new Administrator();
        administrator.setUserId(userId);

        when(administratorRepository.findById(id)).thenReturn(Optional.of(administrator));
        when(userService.updateUserEmail(userId, request.email())).thenReturn(new UserResponseDTO(userId, "newemail@example.com", Role.ROLE_ADMIN));
        when(administratorRepository.save(any())).thenReturn(administrator);
        
        // Not found when refreshing
        when(userRepository.findByIdAndDeletedAtIsNull(userId))
            .thenReturn(Optional.of(mock(User.class))) // First call
            .thenReturn(Optional.empty()); // Second call

        // When & Then
        assertThatThrownBy(() -> administratorService.patch(id, request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("User not found");
    }

    @Test
    void shouldPatchAdministratorSuccessfullyWithoutEmailUpdate() {
        // Given
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        PatchAdministratorRequestDTO request = new PatchAdministratorRequestDTO(
            "John Patched", "Doe Patched", null
        );
        
        Administrator administrator = new Administrator();
        administrator.setId(id);
        administrator.setUserId(userId);
        administrator.setFirstName("John");
        administrator.setLastName("Doe");

        User user = mock(User.class);
        when(user.getEmail()).thenReturn("john@example.com");
        when(user.isActive()).thenReturn(true);
        when(user.getCreatedAt()).thenReturn(Instant.now());
        when(user.getUpdatedAt()).thenReturn(Instant.now());

        when(administratorRepository.findById(id)).thenReturn(Optional.of(administrator));
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.of(user));
        when(administratorRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        AdministratorResponseDTO result = administratorService.patch(id, request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.firstName()).isEqualTo("John Patched");
        assertThat(result.lastName()).isEqualTo("Doe Patched");
        assertThat(result.email()).isEqualTo("john@example.com"); // Original email

        verify(userService, never()).updateUserEmail(any(), any());
    }

    @Test
    void shouldPatchAdministratorSuccessfullyWithOnlyEmailUpdate() {
        // Given
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        PatchAdministratorRequestDTO request = new PatchAdministratorRequestDTO(
            null, null, "newemail@example.com"
        );
        
        Administrator administrator = new Administrator();
        administrator.setId(id);
        administrator.setUserId(userId);
        administrator.setFirstName("John");
        administrator.setLastName("Doe");

        User user = mock(User.class);
        when(user.getEmail()).thenReturn("newemail@example.com");
        when(user.isActive()).thenReturn(true);
        when(user.getCreatedAt()).thenReturn(Instant.now());
        when(user.getUpdatedAt()).thenReturn(Instant.now());

        when(administratorRepository.findById(id)).thenReturn(Optional.of(administrator));
        when(userService.updateUserEmail(userId, request.email())).thenReturn(new UserResponseDTO(userId, "newemail@example.com", Role.ROLE_ADMIN));
        when(administratorRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.of(user));

        // When
        AdministratorResponseDTO result = administratorService.patch(id, request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.firstName()).isEqualTo("John"); // Unchanged
        assertThat(result.lastName()).isEqualTo("Doe"); // Unchanged
        assertThat(result.email()).isEqualTo("newemail@example.com"); // Updated
    }

    @Test
    void shouldLogWarningWhenDeletingNonExistentAdministrator() {
        // Given
        UUID id = UUID.randomUUID();

        when(administratorRepository.findById(id)).thenReturn(Optional.empty());

        // When
        administratorService.delete(id);

        // Then
        verify(userService, never()).delete(any());
    }

    @Test
    void findAll_returnsEmptyPage_whenOffsetExceedsResults() {
        // Arrange
        String searchTerm = "test";
        // Page 2 (index 1), size 10. Offset = 10.
        Pageable pageable = PageRequest.of(1, 10);
        
        // Only 5 results found
        List<AdministratorListItemResponseDTO> results = new java.util.ArrayList<>();
        for (int i = 0; i < 5; i++) {
            results.add(new AdministratorListItemResponseDTO(UUID.randomUUID(), "First", "Last", "email", "Name", true, Instant.now()));
        }

        when(administratorRepository.findBySearchTermAndActive("%test%")).thenReturn(results);

        // Act
        Page<AdministratorListItemResponseDTO> page = administratorService.findAll(searchTerm, pageable, false);

        // Assert
        assertThat(page.isEmpty()).isTrue();
        assertThat(page.getNumberOfElements()).isEqualTo(0);
        assertThat(page.getTotalElements()).isEqualTo(5); // Total elements should still be 5
        assertThat(page.getTotalPages()).isEqualTo(1);    // 5 elements / 10 per page = 1 page
    }

    @Test
    void findAll_returnsPartialPage_whenEndIsClipped() {
        // Arrange
        String searchTerm = "test";
        // Page 0, size 10.
        Pageable pageable = PageRequest.of(0, 10);
        
        // 5 results found (less than page size)
        List<AdministratorListItemResponseDTO> results = new java.util.ArrayList<>();
        for (int i = 0; i < 5; i++) {
            results.add(new AdministratorListItemResponseDTO(UUID.randomUUID(), "First", "Last", "email", "Name", true, Instant.now()));
        }

        when(administratorRepository.findBySearchTermAndActive("%test%")).thenReturn(results);

        // Act
        Page<AdministratorListItemResponseDTO> page = administratorService.findAll(searchTerm, pageable, false);

        // Assert
        assertThat(page.getNumberOfElements()).isEqualTo(5);
        assertThat(page.getTotalElements()).isEqualTo(5);
        assertThat(page.getTotalPages()).isEqualTo(1);
    }
    
    @Test
    void findAll_returnsCorrectSublist_whenPaginationIsApplied() {
        // Arrange
        String searchTerm = "test";
        // Page 1 (index 1), size 2. Offset = 2.
        Pageable pageable = PageRequest.of(1, 2);
        
        // 5 results found
        List<AdministratorListItemResponseDTO> results = new java.util.ArrayList<>();
        for (int i = 0; i < 5; i++) {
            results.add(new AdministratorListItemResponseDTO(UUID.randomUUID(), "First" + i, "Last", "email", "Name", true, Instant.now()));
        }

        when(administratorRepository.findBySearchTermAndActive("%test%")).thenReturn(results);

        // Act
        Page<AdministratorListItemResponseDTO> page = administratorService.findAll(searchTerm, pageable, false);

        // Assert
        assertThat(page.getNumberOfElements()).isEqualTo(2);
        assertThat(page.getContent().get(0).firstName()).isEqualTo("First2");
        assertThat(page.getContent().get(1).firstName()).isEqualTo("First3");
    }
}
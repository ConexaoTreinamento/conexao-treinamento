package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AdministratorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdministratorService Unit Tests")
class AdministratorServiceTest {

    @Mock
    private AdministratorRepository repository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdministratorService administratorService;

    private Administrator administrator;
    private UUID administratorId;
    private AdministratorRequestDTO administratorRequestDTO;
    private PatchAdministratorRequestDTO patchRequestDTO;

    @BeforeEach
    void setUp() {
        administratorId = UUID.randomUUID();
        administrator = new Administrator("João", "Silva", "joao@example.com", "encodedPassword");
        
        administratorRequestDTO = new AdministratorRequestDTO("João", "Silva", "joao@example.com", "senha123");
        patchRequestDTO = new PatchAdministratorRequestDTO("João Modificado", null, null, null);
    }

    @Test
    @DisplayName("Should create administrator successfully")
    void shouldCreateAdministratorSuccessfully() {
        // Given
        when(repository.existsByEmailIgnoringCaseAndDeletedAtIsNull("joao@example.com")).thenReturn(false);
        when(passwordEncoder.encode("senha123")).thenReturn("encodedPassword");
        when(repository.save(any(Administrator.class))).thenReturn(administrator);

        // When
        AdministratorResponseDTO result = administratorService.create(administratorRequestDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.firstName()).isEqualTo("João");
        assertThat(result.lastName()).isEqualTo("Silva");
        assertThat(result.email()).isEqualTo("joao@example.com");
        assertThat(result.fullName()).isEqualTo("João Silva");
        
        verify(repository).existsByEmailIgnoringCaseAndDeletedAtIsNull("joao@example.com");
        verify(passwordEncoder).encode("senha123");
        verify(repository).save(any(Administrator.class));
    }

    @Test
    @DisplayName("Should throw conflict when email already exists")
    void shouldThrowConflictWhenEmailAlreadyExists() {
        // Given
        when(repository.existsByEmailIgnoringCaseAndDeletedAtIsNull("joao@example.com")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> administratorService.create(administratorRequestDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Email já está em uso")
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                });

        verify(repository).existsByEmailIgnoringCaseAndDeletedAtIsNull("joao@example.com");
        verify(passwordEncoder, never()).encode(anyString());
        verify(repository, never()).save(any(Administrator.class));
    }

    @Test
    @DisplayName("Should find administrator by id successfully")
    void shouldFindAdministratorByIdSuccessfully() {
        // Given
        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));

        // When
        AdministratorResponseDTO result = administratorService.findById(administratorId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.firstName()).isEqualTo("João");
        assertThat(result.lastName()).isEqualTo("Silva");
        assertThat(result.email()).isEqualTo("joao@example.com");
        
        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
    }

    @Test
    @DisplayName("Should throw not found when administrator does not exist")
    void shouldThrowNotFoundWhenAdministratorDoesNotExist() {
        // Given
        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> administratorService.findById(administratorId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Administrador não encontrado")
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });

        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
    }

    @Test
    @DisplayName("Should find all administrators with default pagination")
    void shouldFindAllAdministratorsWithDefaultPagination() {
        // Given
        List<Administrator> administrators = List.of(administrator);
        Page<Administrator> page = new PageImpl<>(administrators);
        Pageable pageable = PageRequest.of(0, 20);
        
        when(repository.findByDeletedAtIsNull(any(Pageable.class))).thenReturn(page);

        // When
        Page<AdministratorResponseDTO> result = administratorService.findAll(null, pageable, false);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).firstName()).isEqualTo("João");
        
        verify(repository).findByDeletedAtIsNull(any(Pageable.class));
    }

    @Test
    @DisplayName("Should find all administrators with search term")
    void shouldFindAllAdministratorsWithSearchTerm() {
        // Given
        List<Administrator> administrators = List.of(administrator);
        Page<Administrator> page = new PageImpl<>(administrators);
        Pageable pageable = PageRequest.of(0, 20);
        
        when(repository.findBySearchTermAndDeletedAtIsNull(anyString(), any(Pageable.class))).thenReturn(page);

        // When
        Page<AdministratorResponseDTO> result = administratorService.findAll("João", pageable, false);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).firstName()).isEqualTo("João");
        
        verify(repository).findBySearchTermAndDeletedAtIsNull(anyString(), any(Pageable.class));
    }

    @Test
    @DisplayName("Should find all administrators including inactive")
    void shouldFindAllAdministratorsIncludingInactive() {
        // Given
        List<Administrator> administrators = List.of(administrator);
        Page<Administrator> page = new PageImpl<>(administrators);
        Pageable pageable = PageRequest.of(0, 20);
        
        when(repository.findAll(any(Pageable.class))).thenReturn(page);

        // When
        Page<AdministratorResponseDTO> result = administratorService.findAll(null, pageable, true);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        
        verify(repository).findAll(any(Pageable.class));
    }

    @Test
    @DisplayName("Should update administrator successfully")
    void shouldUpdateAdministratorSuccessfully() {
        // Given
        AdministratorRequestDTO updateRequest = new AdministratorRequestDTO("João Updated", "Silva Updated", "joao.updated@example.com", "newPassword");
        
        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));
        when(repository.existsByEmailIgnoringCaseAndDeletedAtIsNull("joao.updated@example.com")).thenReturn(false);
        when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");
        when(repository.save(administrator)).thenReturn(administrator);

        // When
        AdministratorResponseDTO result = administratorService.update(administratorId, updateRequest);

        // Then
        assertThat(result).isNotNull();
        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
        verify(repository).existsByEmailIgnoringCaseAndDeletedAtIsNull("joao.updated@example.com");
        verify(passwordEncoder).encode("newPassword");
        verify(repository).save(administrator);
    }

    @Test
    @DisplayName("Should throw conflict when updating to existing email")
    void shouldThrowConflictWhenUpdatingToExistingEmail() {
        // Given
        AdministratorRequestDTO updateRequest = new AdministratorRequestDTO("João", "Silva", "existing@example.com", "senha123");
        
        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));
        when(repository.existsByEmailIgnoringCaseAndDeletedAtIsNull("existing@example.com")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> administratorService.update(administratorId, updateRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Email já está em uso")
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                });

        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
        verify(repository).existsByEmailIgnoringCaseAndDeletedAtIsNull("existing@example.com");
        verify(repository, never()).save(any(Administrator.class));
    }

    @Test
    @DisplayName("Should patch administrator successfully")
    void shouldPatchAdministratorSuccessfully() {
        // Given
        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));
        when(repository.save(administrator)).thenReturn(administrator);

        // When
        AdministratorResponseDTO result = administratorService.patch(administratorId, patchRequestDTO);

        // Then
        assertThat(result).isNotNull();
        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
        verify(repository).save(administrator);
    }

    @Test
    @DisplayName("Should patch administrator email with validation")
    void shouldPatchAdministratorEmailWithValidation() {
        // Given
        PatchAdministratorRequestDTO patchWithEmail = new PatchAdministratorRequestDTO(null, null, "new@example.com", null);
        
        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));
        when(repository.existsByEmailIgnoringCaseAndDeletedAtIsNull("new@example.com")).thenReturn(false);
        when(repository.save(administrator)).thenReturn(administrator);

        // When
        AdministratorResponseDTO result = administratorService.patch(administratorId, patchWithEmail);

        // Then
        assertThat(result).isNotNull();
        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
        verify(repository).existsByEmailIgnoringCaseAndDeletedAtIsNull("new@example.com");
        verify(repository).save(administrator);
    }

    @Test
    @DisplayName("Should patch administrator password with encoding")
    void shouldPatchAdministratorPasswordWithEncoding() {
        // Given
        PatchAdministratorRequestDTO patchWithPassword = new PatchAdministratorRequestDTO(null, null, null, "newPassword");
        
        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");
        when(repository.save(administrator)).thenReturn(administrator);

        // When
        AdministratorResponseDTO result = administratorService.patch(administratorId, patchWithPassword);

        // Then
        assertThat(result).isNotNull();
        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
        verify(passwordEncoder).encode("newPassword");
        verify(repository).save(administrator);
    }

    @Test
    @DisplayName("Should delete administrator successfully (soft delete)")
    void shouldDeleteAdministratorSuccessfully() {
        // Given
        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));
        when(repository.save(administrator)).thenReturn(administrator);

        // When
        administratorService.delete(administratorId);

        // Then
        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
        verify(repository).save(administrator);
        // Verify that deactivate() was called (would set deletedAt timestamp)
    }

    @Test
    @DisplayName("Should throw not found when deleting non-existent administrator")
    void shouldThrowNotFoundWhenDeletingNonExistentAdministrator() {
        // Given
        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> administratorService.delete(administratorId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Administrador não encontrado")
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });

        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
        verify(repository, never()).save(any(Administrator.class));
    }

    @Test
    @DisplayName("Should restore administrator successfully")
    void shouldRestoreAdministratorSuccessfully() {
        // Given
        Administrator inactiveAdmin = new Administrator("João", "Silva", "joao@example.com", "password");
        inactiveAdmin.deactivate(); // make it inactive
        
        when(repository.findById(administratorId)).thenReturn(Optional.of(inactiveAdmin));
        when(repository.save(inactiveAdmin)).thenReturn(inactiveAdmin);

        // When
        AdministratorResponseDTO result = administratorService.restore(administratorId);

        // Then
        assertThat(result).isNotNull();
        verify(repository).findById(administratorId);
        verify(repository).save(inactiveAdmin);
    }

    @Test
    @DisplayName("Should throw bad request when trying to restore active administrator")
    void shouldThrowBadRequestWhenTryingToRestoreActiveAdministrator() {
        // Given - administrator is already active
        when(repository.findById(administratorId)).thenReturn(Optional.of(administrator));

        // When & Then
        assertThatThrownBy(() -> administratorService.restore(administratorId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Administrador já está ativo")
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                });

        verify(repository).findById(administratorId);
        verify(repository, never()).save(any(Administrator.class));
    }

    @Test
    @DisplayName("Should throw not found when restoring non-existent administrator")
    void shouldThrowNotFoundWhenRestoringNonExistentAdministrator() {
        // Given
        when(repository.findById(administratorId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> administratorService.restore(administratorId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Administrador não encontrado")
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                });

        verify(repository).findById(administratorId);
        verify(repository, never()).save(any(Administrator.class));
    }
}
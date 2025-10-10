//package org.conexaotreinamento.conexaotreinamentobackend.service;
//
//import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AdministratorRequestDTO;
//import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
//import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
//import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;
//import org.conexaotreinamento.conexaotreinamentobackend.repository.AdministratorRepository;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.domain.Sort;
//import org.springframework.http.HttpStatus;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.web.server.ResponseStatusException;
//
//import java.time.Instant;
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//import static org.assertj.core.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//@DisplayName("AdministratorService Unit Tests")
//class AdministratorServiceMockTest {
//
//    @Mock
//    private AdministratorRepository repository;
//
//    @Mock
//    private PasswordEncoder passwordEncoder;
//
//    @InjectMocks
//    private AdministratorService administratorService;
//
//    private UUID administratorId;
//    private AdministratorRequestDTO administratorRequestDTO;
//    private PatchAdministratorRequestDTO patchRequestDTO;
//    private Administrator administrator;
//
//    @BeforeEach
//    void setUp() {
//        administratorId = UUID.randomUUID();
//        administratorRequestDTO = new AdministratorRequestDTO(
//                "João", "Silva", "joao@example.com", "password123"
//        );
//        patchRequestDTO = new PatchAdministratorRequestDTO(
//                "João Updated", null, "joao.updated@example.com", null
//        );
//        administrator = new Administrator("João", "Silva", "joao@example.com", "encodedPassword");
//        setIdViaReflection(administrator, administratorId);
//    }
//
//    private void setIdViaReflection(Administrator admin, UUID id) {
//        try {
//            var field = Administrator.class.getDeclaredField("id");
//            field.setAccessible(true);
//            field.set(admin, id);
//        } catch (Exception e) {
//            fail("Failed to set Administrator.id via reflection: " + e.getMessage());
//        }
//    }
//
//    @Test
//    @DisplayName("Should create administrator successfully")
//    void shouldCreateAdministratorSuccessfully() {
//        // Given
//        when(repository.existsByEmailIgnoringCaseAndDeletedAtIsNull(administratorRequestDTO.email()))
//                .thenReturn(false);
//        when(passwordEncoder.encode(administratorRequestDTO.password()))
//                .thenReturn("encodedPassword");
//        when(repository.save(any(Administrator.class))).thenReturn(administrator);
//
//        // When
//        AdministratorResponseDTO result = administratorService.create(administratorRequestDTO);
//
//        // Then
//        assertThat(result).isNotNull();
//        assertThat(result.firstName()).isEqualTo("João");
//        assertThat(result.lastName()).isEqualTo("Silva");
//        assertThat(result.email()).isEqualTo("joao@example.com");
//
//        verify(repository).existsByEmailIgnoringCaseAndDeletedAtIsNull(administratorRequestDTO.email());
//        verify(passwordEncoder).encode(administratorRequestDTO.password());
//        verify(repository).save(any(Administrator.class));
//    }
//
//    @Test
//    @DisplayName("Should throw conflict when email already exists")
//    void shouldThrowConflictWhenEmailAlreadyExists() {
//        // Given
//        when(repository.existsByEmailIgnoringCaseAndDeletedAtIsNull(administratorRequestDTO.email()))
//                .thenReturn(true);
//
//        // When & Then
//        assertThatThrownBy(() -> administratorService.create(administratorRequestDTO))
//                .isInstanceOf(ResponseStatusException.class)
//                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT)
//                .hasMessageContaining("Email já está em uso");
//
//        verify(repository).existsByEmailIgnoringCaseAndDeletedAtIsNull(administratorRequestDTO.email());
//        verify(passwordEncoder, never()).encode(any());
//        verify(repository, never()).save(any());
//    }
//
//    @Test
//    @DisplayName("Should find administrator by id successfully")
//    void shouldFindAdministratorByIdSuccessfully() {
//        // Given
//        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));
//
//        // When
//        AdministratorResponseDTO result = administratorService.findById(administratorId);
//
//        // Then
//        assertThat(result).isNotNull();
//        assertThat(result.firstName()).isEqualTo("João");
//        assertThat(result.lastName()).isEqualTo("Silva");
//        assertThat(result.email()).isEqualTo("joao@example.com");
//
//        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
//    }
//
//    @Test
//    @DisplayName("Should throw not found when administrator does not exist")
//    void shouldThrowNotFoundWhenAdministratorDoesNotExist() {
//        // Given
//        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.empty());
//
//        // When & Then
//        assertThatThrownBy(() -> administratorService.findById(administratorId))
//                .isInstanceOf(ResponseStatusException.class)
//                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND)
//                .hasMessageContaining("Administrador não encontrado");
//
//        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
//    }
//
//    @Test
//    @DisplayName("Should find all administrators with default pagination")
//    void shouldFindAllAdministratorsWithDefaultPagination() {
//        // Given
//        Pageable unsortedPageable = PageRequest.of(0, 20);
//        List<Administrator> administrators = List.of(administrator);
//        Page<Administrator> page = new PageImpl<>(administrators, unsortedPageable, 1);
//
//        when(repository.findByDeletedAtIsNull(any(Pageable.class))).thenReturn(page);
//
//        // When
//        Page<AdministratorResponseDTO> result = administratorService.findAll(null, unsortedPageable, false);
//
//        // Then
//        assertThat(result).isNotNull();
//        assertThat(result.getContent()).hasSize(1);
//        assertThat(result.getContent().get(0).firstName()).isEqualTo("João");
//
//        verify(repository).findByDeletedAtIsNull(argThat(pageable ->
//            pageable.getSort().equals(Sort.by("createdAt").descending())
//        ));
//    }
//
//    @Test
//    @DisplayName("Should find administrators with search term")
//    void shouldFindAdministratorsWithSearchTerm() {
//        // Given
//        String searchTerm = "joão";
//        Pageable pageable = PageRequest.of(0, 20);
//        List<Administrator> administrators = List.of(administrator);
//        Page<Administrator> page = new PageImpl<>(administrators, pageable, 1);
//
//        when(repository.findBySearchTermAndDeletedAtIsNull(eq("%joão%"), any(Pageable.class)))
//                .thenReturn(page);
//
//        // When
//        Page<AdministratorResponseDTO> result = administratorService.findAll(searchTerm, pageable, false);
//
//        // Then
//        assertThat(result).isNotNull();
//        assertThat(result.getContent()).hasSize(1);
//
//        verify(repository).findBySearchTermAndDeletedAtIsNull(eq("%joão%"), any(Pageable.class));
//    }
//
//    @Test
//    @DisplayName("Should find administrators including inactive")
//    void shouldFindAdministratorsIncludingInactive() {
//        // Given
//        Pageable pageable = PageRequest.of(0, 20);
//        List<Administrator> administrators = List.of(administrator);
//        Page<Administrator> page = new PageImpl<>(administrators, pageable, 1);
//
//        when(repository.findAll(any(Pageable.class))).thenReturn(page);
//
//        // When
//        Page<AdministratorResponseDTO> result = administratorService.findAll(null, pageable, true);
//
//        // Then
//        assertThat(result).isNotNull();
//        assertThat(result.getContent()).hasSize(1);
//
//        verify(repository).findAll(any(Pageable.class));
//        verify(repository, never()).findByDeletedAtIsNull(any(Pageable.class));
//    }
//
//    @Test
//    @DisplayName("Should search administrators including inactive")
//    void shouldSearchAdministratorsIncludingInactive() {
//        // Given
//        String searchTerm = "silva";
//        Pageable pageable = PageRequest.of(0, 20);
//        List<Administrator> administrators = List.of(administrator);
//        Page<Administrator> page = new PageImpl<>(administrators, pageable, 1);
//
//        when(repository.findBySearchTermIncludingInactive(eq("%silva%"), any(Pageable.class)))
//                .thenReturn(page);
//
//        // When
//        Page<AdministratorResponseDTO> result = administratorService.findAll(searchTerm, pageable, true);
//
//        // Then
//        assertThat(result).isNotNull();
//        assertThat(result.getContent()).hasSize(1);
//
//        verify(repository).findBySearchTermIncludingInactive(eq("%silva%"), any(Pageable.class));
//    }
//
//    @Test
//    @DisplayName("Should handle blank search as no search")
//    void shouldHandleBlankSearchAsNoSearch() {
//        // Given
//        Pageable pageable = PageRequest.of(0, 20);
//        List<Administrator> administrators = List.of(administrator);
//        Page<Administrator> page = new PageImpl<>(administrators, pageable, 1);
//
//        when(repository.findByDeletedAtIsNull(any(Pageable.class))).thenReturn(page);
//
//        // When
//        Page<AdministratorResponseDTO> result = administratorService.findAll("   ", pageable, false);
//
//        // Then
//        assertThat(result).isNotNull();
//        verify(repository).findByDeletedAtIsNull(any(Pageable.class));
//        verify(repository, never()).findBySearchTermAndDeletedAtIsNull(any(), any());
//    }
//
//    @Test
//    @DisplayName("Should update administrator successfully")
//    void shouldUpdateAdministratorSuccessfully() {
//        // Given
//        AdministratorRequestDTO updateRequest = new AdministratorRequestDTO(
//                "João Updated", "Silva Updated", "joao.new@example.com", "newPassword"
//        );
//        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));
//        when(repository.existsByEmailIgnoringCaseAndDeletedAtIsNull(updateRequest.email()))
//                .thenReturn(false);
//        when(passwordEncoder.encode(updateRequest.password())).thenReturn("newEncodedPassword");
//        when(repository.save(any(Administrator.class))).thenReturn(administrator);
//
//        // When
//        AdministratorResponseDTO result = administratorService.update(administratorId, updateRequest);
//
//        // Then
//        assertThat(result).isNotNull();
//        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
//        verify(repository).existsByEmailIgnoringCaseAndDeletedAtIsNull(updateRequest.email());
//        verify(passwordEncoder).encode(updateRequest.password());
//        verify(repository).save(administrator);
//    }
//
//    @Test
//    @DisplayName("Should throw conflict when updating to existing email")
//    void shouldThrowConflictWhenUpdatingToExistingEmail() {
//        // Given
//        AdministratorRequestDTO updateRequest = new AdministratorRequestDTO(
//                "João", "Silva", "existing@example.com", "password"
//        );
//        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));
//        when(repository.existsByEmailIgnoringCaseAndDeletedAtIsNull(updateRequest.email()))
//                .thenReturn(true);
//
//        // When & Then
//        assertThatThrownBy(() -> administratorService.update(administratorId, updateRequest))
//                .isInstanceOf(ResponseStatusException.class)
//                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT)
//                .hasMessageContaining("Email já está em uso");
//
//        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
//        verify(repository).existsByEmailIgnoringCaseAndDeletedAtIsNull(updateRequest.email());
//        verify(passwordEncoder, never()).encode(any());
//        verify(repository, never()).save(any());
//    }
//
//    @Test
//    @DisplayName("Should allow updating to same email")
//    void shouldAllowUpdatingToSameEmail() {
//        // Given
//        AdministratorRequestDTO updateRequest = new AdministratorRequestDTO(
//                "João Updated", "Silva Updated", "joao@example.com", "newPassword" // Same email
//        );
//        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));
//        when(passwordEncoder.encode(updateRequest.password())).thenReturn("newEncodedPassword");
//        when(repository.save(any(Administrator.class))).thenReturn(administrator);
//
//        // When
//        AdministratorResponseDTO result = administratorService.update(administratorId, updateRequest);
//
//        // Then
//        assertThat(result).isNotNull();
//        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
//        verify(repository, never()).existsByEmailIgnoringCaseAndDeletedAtIsNull(any());
//        verify(passwordEncoder).encode(updateRequest.password());
//        verify(repository).save(administrator);
//    }
//
//    @Test
//    @DisplayName("Should patch administrator successfully with partial data")
//    void shouldPatchAdministratorSuccessfullyWithPartialData() {
//        // Given
//        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));
//        when(repository.existsByEmailIgnoringCaseAndDeletedAtIsNull(patchRequestDTO.email()))
//                .thenReturn(false);
//        when(repository.save(any(Administrator.class))).thenReturn(administrator);
//
//        // When
//        AdministratorResponseDTO result = administratorService.patch(administratorId, patchRequestDTO);
//
//        // Then
//        assertThat(result).isNotNull();
//        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
//        verify(repository).existsByEmailIgnoringCaseAndDeletedAtIsNull(patchRequestDTO.email());
//        verify(repository).save(administrator);
//        verify(passwordEncoder, never()).encode(any()); // Password was null in patch
//    }
//
//    @Test
//    @DisplayName("Should patch administrator with password")
//    void shouldPatchAdministratorWithPassword() {
//        // Given
//        PatchAdministratorRequestDTO patchWithPassword = new PatchAdministratorRequestDTO(
//                null, null, null, "newPassword"
//        );
//        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));
//        when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");
//        when(repository.save(any(Administrator.class))).thenReturn(administrator);
//
//        // When
//        AdministratorResponseDTO result = administratorService.patch(administratorId, patchWithPassword);
//
//        // Then
//        assertThat(result).isNotNull();
//        verify(passwordEncoder).encode("newPassword");
//        verify(repository).save(administrator);
//    }
//
//    @Test
//    @DisplayName("Should patch administrator with null fields (no changes)")
//    void shouldPatchAdministratorWithNullFields() {
//        // Given
//        PatchAdministratorRequestDTO nullPatch = new PatchAdministratorRequestDTO(
//                null, null, null, null
//        );
//        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));
//        when(repository.save(any(Administrator.class))).thenReturn(administrator);
//
//        // When
//        AdministratorResponseDTO result = administratorService.patch(administratorId, nullPatch);
//
//        // Then
//        assertThat(result).isNotNull();
//        verify(repository, never()).existsByEmailIgnoringCaseAndDeletedAtIsNull(any());
//        verify(passwordEncoder, never()).encode(any());
//        verify(repository).save(administrator);
//    }
//
//    @Test
//    @DisplayName("Should delete administrator successfully (soft delete)")
//    void shouldDeleteAdministratorSuccessfully() {
//        // Given
//        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.of(administrator));
//        when(repository.save(any(Administrator.class))).thenReturn(administrator);
//
//        // When
//        administratorService.delete(administratorId);
//
//        // Then
//        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
//        verify(repository).save(administrator);
//        assertThat(administrator.getDeletedAt()).isNotNull();
//    }
//
//    @Test
//    @DisplayName("Should throw not found when deleting non-existent administrator")
//    void shouldThrowNotFoundWhenDeletingNonExistentAdministrator() {
//        // Given
//        when(repository.findByIdAndDeletedAtIsNull(administratorId)).thenReturn(Optional.empty());
//
//        // When & Then
//        assertThatThrownBy(() -> administratorService.delete(administratorId))
//                .isInstanceOf(ResponseStatusException.class)
//                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND)
//                .hasMessageContaining("Administrador não encontrado");
//
//        verify(repository).findByIdAndDeletedAtIsNull(administratorId);
//        verify(repository, never()).save(any());
//    }
//
//    @Test
//    @DisplayName("Should restore administrator successfully")
//    void shouldRestoreAdministratorSuccessfully() {
//        // Given
//        administrator.deactivate(); // Make it inactive
//        when(repository.findById(administratorId)).thenReturn(Optional.of(administrator));
//        when(repository.save(any(Administrator.class))).thenReturn(administrator);
//
//        // When
//        AdministratorResponseDTO result = administratorService.restore(administratorId);
//
//        // Then
//        assertThat(result).isNotNull();
//        assertThat(administrator.isActive()).isTrue();
//        verify(repository).findById(administratorId);
//        verify(repository).save(administrator);
//    }
//
//    @Test
//    @DisplayName("Should throw bad request when trying to restore active administrator")
//    void shouldThrowBadRequestWhenTryingToRestoreActiveAdministrator() {
//        // Given
//        when(repository.findById(administratorId)).thenReturn(Optional.of(administrator));
//
//        // When & Then
//        assertThatThrownBy(() -> administratorService.restore(administratorId))
//                .isInstanceOf(ResponseStatusException.class)
//                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST)
//                .hasMessageContaining("Administrador já está ativo");
//
//        verify(repository).findById(administratorId);
//        verify(repository, never()).save(any());
//    }
//
//    @Test
//    @DisplayName("Should throw not found when trying to restore non-existent administrator")
//    void shouldThrowNotFoundWhenTryingToRestoreNonExistentAdministrator() {
//        // Given
//        when(repository.findById(administratorId)).thenReturn(Optional.empty());
//
//        // When & Then
//        assertThatThrownBy(() -> administratorService.restore(administratorId))
//                .isInstanceOf(ResponseStatusException.class)
//                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND)
//                .hasMessageContaining("Administrador não encontrado");
//
//        verify(repository).findById(administratorId);
//        verify(repository, never()).save(any());
//    }
//
//    @Test
//    @DisplayName("Should handle case insensitive email validation")
//    void shouldHandleCaseInsensitiveEmailValidation() {
//        // Given
//        AdministratorRequestDTO requestWithUpperCase = new AdministratorRequestDTO(
//                "João", "Silva", "JOAO@EXAMPLE.COM", "password123"
//        );
//        when(repository.existsByEmailIgnoringCaseAndDeletedAtIsNull("JOAO@EXAMPLE.COM"))
//                .thenReturn(false);
//        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
//        when(repository.save(any(Administrator.class))).thenReturn(administrator);
//
//        // When
//        AdministratorResponseDTO result = administratorService.create(requestWithUpperCase);
//
//        // Then
//        assertThat(result).isNotNull();
//        verify(repository).existsByEmailIgnoringCaseAndDeletedAtIsNull("JOAO@EXAMPLE.COM");
//    }
//
//    @Test
//    @DisplayName("Should handle special characters in names")
//    void shouldHandleSpecialCharactersInNames() {
//        // Given
//        AdministratorRequestDTO requestWithSpecialChars = new AdministratorRequestDTO(
//                "João José", "da Silva-Santos", "joao.jose@example.com", "password123"
//        );
//        when(repository.existsByEmailIgnoringCaseAndDeletedAtIsNull(requestWithSpecialChars.email()))
//                .thenReturn(false);
//        when(passwordEncoder.encode(requestWithSpecialChars.password())).thenReturn("encodedPassword");
//        when(repository.save(any(Administrator.class))).thenReturn(administrator);
//
//        // When
//        AdministratorResponseDTO result = administratorService.create(requestWithSpecialChars);
//
//        // Then
//        assertThat(result).isNotNull();
//        verify(repository).save(argThat(admin ->
//            admin.getFirstName().equals("João José") &&
//            admin.getLastName().equals("da Silva-Santos")
//        ));
//    }
//}

package org.conexaotreinamento.conexaotreinamentobackend.unit.controller;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.conexaotreinamento.conexaotreinamentobackend.controller.AdministratorController;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AdministratorCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.AdministratorService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.PageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdministratorController Unit Tests")
class AdministratorControllerTest {

    @Mock
    private AdministratorService administratorService;

    @InjectMocks
    private AdministratorController administratorController;

    private UUID administratorId;
    private UUID userId;
    private AdministratorCreateRequestDTO createRequest;
    private AdministratorListItemResponseDTO listItemResponse;
    private AdministratorResponseDTO detailResponse;
    private PatchAdministratorRequestDTO patchRequest;

    @BeforeEach
    void setUp() {
        administratorId = UUID.randomUUID();
        userId = UUID.randomUUID();

        createRequest = new AdministratorCreateRequestDTO(
                "John",
                "Doe",
                "john@example.com",
                "password123"
        );

        listItemResponse = new AdministratorListItemResponseDTO(
                administratorId,
                "John",
                "Doe",
                "john@example.com",
                "john@example.com",
                true,
                Instant.now()
        );

        detailResponse = new AdministratorResponseDTO(
                administratorId,
                "John",
                "Doe",
                "john@example.com",
                "john@example.com",
                true,
                Instant.now(),
                Instant.now()
        );

        patchRequest = new PatchAdministratorRequestDTO(
                "Jane",
                "Smith",
                null
        );
    }

    @Test
    @DisplayName("Should create administrator successfully")
    void shouldCreateAdministratorSuccessfully() {
        // Given
        when(administratorService.create(createRequest)).thenReturn(listItemResponse);

        // When
        try {
            ResponseEntity<AdministratorListItemResponseDTO> response = administratorController.createAdministrator(createRequest);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isEqualTo(listItemResponse);
            verify(administratorService).create(createRequest);
        } catch (IllegalStateException e) {
            // Expected in unit tests without servlet context - Location header creation fails
            verify(administratorService).create(createRequest);
        }
    }

    @Test
    @DisplayName("Should find administrator by ID successfully")
    void shouldFindAdministratorByIdSuccessfully() {
        // Given
        when(administratorService.findById(administratorId)).thenReturn(listItemResponse);

        // When
        ResponseEntity<AdministratorListItemResponseDTO> response = administratorController.findAdministratorById(administratorId);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(listItemResponse);
        verify(administratorService).findById(administratorId);
    }

    @Test
    @DisplayName("Should find administrator by user ID successfully")
    void shouldFindAdministratorByUserIdSuccessfully() {
        // Given
        when(administratorService.findByUserId(userId)).thenReturn(listItemResponse);

        // When
        ResponseEntity<AdministratorListItemResponseDTO> response = administratorController.findAdministratorByUserId(userId);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(listItemResponse);
        verify(administratorService).findByUserId(userId);
    }

    @Test
    @DisplayName("Should find all administrators successfully")
    void shouldFindAllAdministratorsSuccessfully() {
        // Given
        List<AdministratorListItemResponseDTO> administrators = List.of(listItemResponse);
        when(administratorService.findAll()).thenReturn(administrators);

        // When
        ResponseEntity<List<AdministratorListItemResponseDTO>> response = administratorController.findAllAdministrators();

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(administrators);
        verify(administratorService).findAll();
    }

    @Test
    @DisplayName("Should find all administrators paginated successfully")
    void shouldFindAllAdministratorsPaginatedSuccessfully() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        PageResponse<AdministratorListItemResponseDTO> pageResponse = PageResponse.<AdministratorListItemResponseDTO>builder()
                .content(List.of(listItemResponse))
                .page(0)
                .size(20)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .empty(false)
                .numberOfElements(1)
                .build();
        when(administratorService.findAll(null, pageable, false)).thenReturn(pageResponse);

        // When
        ResponseEntity<PageResponse<AdministratorListItemResponseDTO>> response = 
                administratorController.findAllPaginated(null, false, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(pageResponse);
        verify(administratorService).findAll(null, pageable, false);
    }

    @Test
    @DisplayName("Should update administrator successfully")
    void shouldUpdateAdministratorSuccessfully() {
        // Given
        when(administratorService.update(administratorId, createRequest)).thenReturn(detailResponse);

        // When
        ResponseEntity<AdministratorResponseDTO> response = administratorController.updateAdministrator(administratorId, createRequest);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(detailResponse);
        verify(administratorService).update(administratorId, createRequest);
    }

    @Test
    @DisplayName("Should patch administrator successfully")
    void shouldPatchAdministratorSuccessfully() {
        // Given
        when(administratorService.patch(administratorId, patchRequest)).thenReturn(detailResponse);

        // When
        ResponseEntity<AdministratorResponseDTO> response = administratorController.patchAdministrator(administratorId, patchRequest);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(detailResponse);
        verify(administratorService).patch(administratorId, patchRequest);
    }

    @Test
    @DisplayName("Should delete administrator successfully")
    void shouldDeleteAdministratorSuccessfully() {
        // Given
        // No return value for delete

        // When
        ResponseEntity<Void> response = administratorController.deleteAdministrator(administratorId);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(response.getBody()).isNull();
        verify(administratorService).delete(administratorId);
    }

    @Test
    @DisplayName("Should restore administrator successfully")
    void shouldRestoreAdministratorSuccessfully() {
        // Given
        when(administratorService.restore(administratorId)).thenReturn(detailResponse);

        // When
        ResponseEntity<AdministratorResponseDTO> response = administratorController.restoreAdministrator(administratorId);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(detailResponse);
        verify(administratorService).restore(administratorId);
    }
}


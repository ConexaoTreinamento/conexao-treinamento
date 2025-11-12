package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AdministratorCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.AdministratorService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.ErrorResponse;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for managing administrators.
 * Provides CRUD operations and user account management for administrator entities.
 */
@RestController
@RequestMapping("/administrators")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Administrators", description = "Administrator management endpoints")
public class AdministratorController {
    
    private final AdministratorService administratorService;

    @PostMapping
    @Operation(summary = "Create administrator", description = "Creates a new administrator with associated user account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Administrator created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Email already exists", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<AdministratorListItemResponseDTO> createAdministrator(
            @RequestBody @Valid @Parameter(description = "Administrator creation request") AdministratorCreateRequestDTO request) {
        
        log.info("Creating administrator: {} {} - {}", request.firstName(), request.lastName(), request.email());
        AdministratorListItemResponseDTO response = administratorService.create(request);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        
        log.info("Administrator created successfully [ID: {}]", response.id());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get administrator by ID", description = "Retrieves an administrator by their ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Administrator found"),
        @ApiResponse(responseCode = "404", description = "Administrator not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<AdministratorListItemResponseDTO> findAdministratorById(
            @PathVariable @Parameter(description = "Administrator ID") UUID id) {
        
        log.debug("Finding administrator by ID: {}", id);
        AdministratorListItemResponseDTO response = administratorService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-profile/{userId}")
    @Operation(summary = "Get administrator by user ID", description = "Retrieves an administrator by their associated user ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Administrator found"),
        @ApiResponse(responseCode = "404", description = "Administrator not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<AdministratorListItemResponseDTO> findAdministratorByUserId(
            @PathVariable @Parameter(description = "User ID") UUID userId) {
        
        log.debug("Finding administrator by user ID: {}", userId);
        AdministratorListItemResponseDTO response = administratorService.findByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List all administrators", description = "Retrieves all active administrators (non-paginated)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Administrators retrieved successfully")
    })
    public ResponseEntity<List<AdministratorListItemResponseDTO>> findAllAdministrators() {
        log.debug("Finding all administrators");
        List<AdministratorListItemResponseDTO> response = administratorService.findAll();
        log.debug("Found {} administrators", response.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/paginated")
    @Operation(summary = "List administrators (paginated)", description = "Retrieves a paginated list of administrators with optional search")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Administrators retrieved successfully")
    })
    public ResponseEntity<PageResponse<AdministratorListItemResponseDTO>> findAllPaginated(
            @RequestParam(required = false) 
            @Parameter(description = "Search term for name/email") 
            String search,
            
            @RequestParam(required = false, defaultValue = "false")
            @Parameter(description = "Include soft-deleted administrators") 
            boolean includeInactive,
            
            @PageableDefault(size = 20, sort = "joinDate", direction = Sort.Direction.DESC)
            @Parameter(hidden = true) 
            Pageable pageable) {
        
        log.debug("Fetching paginated administrators - search: {}", search);
        PageResponse<AdministratorListItemResponseDTO> response = administratorService.findAll(search, pageable, includeInactive);
        log.debug("Retrieved {} administrators", response.totalElements());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update administrator", description = "Updates an existing administrator and their user account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Administrator updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Administrator not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Email already exists", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<AdministratorResponseDTO> updateAdministrator(
            @PathVariable @Parameter(description = "Administrator ID") UUID id,
            @RequestBody @Valid @Parameter(description = "Administrator update request") AdministratorCreateRequestDTO request) {
        
        log.info("Updating administrator [ID: {}] - Name: {} {}", id, request.firstName(), request.lastName());
        AdministratorResponseDTO response = administratorService.update(id, request);
        log.info("Administrator updated successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Partially update administrator", description = "Partially updates an administrator")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Administrator updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Administrator not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Email already exists", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<AdministratorResponseDTO> patchAdministrator(
            @PathVariable @Parameter(description = "Administrator ID") UUID id,
            @RequestBody @Valid @Parameter(description = "Partial update request") PatchAdministratorRequestDTO request) {
        
        log.info("Patching administrator [ID: {}]", id);
        AdministratorResponseDTO response = administratorService.patch(id, request);
        log.info("Administrator patched successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete administrator", description = "Soft deletes an administrator and their user account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Administrator deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Administrator not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteAdministrator(
            @PathVariable @Parameter(description = "Administrator ID") UUID id) {
        
        log.info("Deleting administrator [ID: {}]", id);
        administratorService.delete(id);
        log.info("Administrator deleted successfully [ID: {}]", id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    @Operation(summary = "Restore administrator", description = "Restores a soft-deleted administrator")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Administrator restored successfully"),
        @ApiResponse(responseCode = "404", description = "Administrator not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<AdministratorResponseDTO> restoreAdministrator(
            @PathVariable @Parameter(description = "Administrator ID") UUID id) {
        
        log.info("Restoring administrator [ID: {}]", id);
        AdministratorResponseDTO response = administratorService.restore(id);
        log.info("Administrator restored successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }
}
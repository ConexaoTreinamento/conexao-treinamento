package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.net.URI;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ChangePasswordRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchUserRoleRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.UserCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.UserService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.ErrorResponse;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
 * REST controller for user account management.
 */
@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User account management")
public class UserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create user", description = "Creates a new user account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "User created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or email already in use", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<UserResponseDTO> createUser(
            @RequestBody @Valid @Parameter(description = "User creation request") UserCreateRequestDTO createUserRequest) {
        
        log.info("Creating new user with email: {}", createUserRequest.email());
        UserResponseDTO userResponse = userService.createUser(createUserRequest);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(userResponse.id())
                .toUri();
        
        log.info("User created successfully [ID: {}] - Email: {}", userResponse.id(), userResponse.email());
        return ResponseEntity.created(location).body(userResponse);
    }

    @GetMapping
    @Operation(summary = "List users", description = "Retrieves all active users with pagination")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Users retrieved successfully")
    })
    public ResponseEntity<PageResponse<UserResponseDTO>> getAllUsers(
            @Parameter(hidden = true) Pageable pageable) {
        
        log.debug("Fetching all users - Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<UserResponseDTO> users = userService.findAll(pageable);
        log.debug("Retrieved {} users", users.getTotalElements());
        return ResponseEntity.ok(PageResponse.of(users));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update user role", description = "Updates a user's role")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User role updated successfully"),
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<UserResponseDTO> patchUserRole(
            @PathVariable @Parameter(description = "User ID") UUID id,
            @RequestBody @Valid @Parameter(description = "Role update request") PatchUserRoleRequestDTO request) {
        
        log.info("Updating user role [ID: {}] to role: {}", id, request.role());
        UserResponseDTO response = userService.patch(id, request);
        log.info("User role updated successfully [ID: {}] - New role: {}", id, response.role());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/change-password")
    @Operation(summary = "Change own password", description = "Allows authenticated user to change their password")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Password changed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid password or validation failed", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> changeOwnPassword(
            @RequestBody @Valid @Parameter(description = "Password change request") ChangePasswordRequestDTO request) {
        
        // Get currently authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null) {
            log.warn("Password change attempt without authentication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        var userOpt = userService.getUserByEmail(userEmail);
        if (userOpt.isEmpty()) {
            log.warn("Password change attempt for non-existent user: {}", userEmail);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UUID currentUserId = userOpt.get().id();

        log.info("Password change request for user: {} [ID: {}]", userEmail, currentUserId);
        userService.changeOwnPassword(currentUserId, request);
        log.info("Password changed successfully for user: {} [ID: {}]", userEmail, currentUserId);

        return ResponseEntity.noContent().build();
    }

}

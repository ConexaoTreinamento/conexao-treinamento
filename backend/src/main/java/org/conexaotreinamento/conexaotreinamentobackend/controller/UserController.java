package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ChangePasswordRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateUserRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchUserRoleRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ResetTrainerPasswordDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
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

import jakarta.persistence.EntityListeners;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/users")
@EntityListeners(AuditingEntityListener.class)
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Delete and create task
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody CreateUserRequestDTO createUserRequest) {
        log.info("Creating new user with email: {}", createUserRequest.email());
        UserResponseDTO userResponse = userService.createUser(createUserRequest);
        log.info("User created successfully [ID: {}] - Email: {}", userResponse.id(), userResponse.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
    }

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> getAllUsersSimple(Pageable pageable) {
        log.debug("Fetching all users - Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<UserResponseDTO> users = userService.findAll(pageable);
        log.debug("Retrieved {} users", users.getTotalElements());
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserResponseDTO> patch(@PathVariable UUID id, @RequestBody @Valid PatchUserRoleRequestDTO request) {
        log.info("Updating user role [ID: {}] to role: {}", id, request.role());
        UserResponseDTO response = userService.patch(id, request);
        log.info("User role updated successfully [ID: {}] - New role: {}", id, response.role());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<Void> changeOwnPassword(@RequestBody @Valid ChangePasswordRequestDTO request) {
        // 1. Search for the currently authenticated user
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

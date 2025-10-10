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

@RestController
@RequestMapping("/users")
@EntityListeners(AuditingEntityListener.class)
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Delete and create task
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody CreateUserRequestDTO createUserRequest) {
        UserResponseDTO userResponse = userService.createUser(createUserRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
    }

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> getAllUsersSimple(Pageable pageable) {
        Page<UserResponseDTO> users = userService.findAll(pageable);
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserResponseDTO> patch(@PathVariable UUID id, @RequestBody @Valid PatchUserRoleRequestDTO request) {
        return ResponseEntity.ok(userService.patch(id, request));
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<Void> changeOwnPassword(@RequestBody @Valid ChangePasswordRequestDTO request) {
        // 1. Search for the currently authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        var userOpt = userService.getUserByEmail(userEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UUID currentUserId = userOpt.get().id();

        userService.changeOwnPassword(currentUserId, request);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(
            @PathVariable UUID id,
            @RequestBody @Valid ResetTrainerPasswordDTO request
    ) {
        userService.updateUserPassword(id, request.newPassword());
        return ResponseEntity.noContent().build();
    }

}

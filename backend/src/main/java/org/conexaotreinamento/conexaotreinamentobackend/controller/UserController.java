package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.util.List;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateUserRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.UserService;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
    @PostMapping("/create")
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody CreateUserRequestDTO createUserRequest) {
        UserResponseDTO userResponse = userService.createUser(createUserRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
    }

    // Delete and create task
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);

    }

    // Task
    // Search UserbyEmail

    // Task
    // Delete User
}
package org.conexaotreinamento.conexaotreinamentobackend.controller;

<<<<<<< HEAD
import java.util.List;

=======
import jakarta.persistence.EntityListeners;
import lombok.RequiredArgsConstructor;
>>>>>>> 4a4a4a0e65274bff2ef97451958a72647b054001
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateUserRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

<<<<<<< HEAD
import jakarta.persistence.EntityListeners;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

=======
>>>>>>> 4a4a4a0e65274bff2ef97451958a72647b054001
@RestController
@RequestMapping("/users")
@EntityListeners(AuditingEntityListener.class)
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

<<<<<<< HEAD
    // Delete and create task
    @PostMapping("/create")
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody CreateUserRequestDTO createUserRequest) {
=======
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody CreateUserRequestDTO createUserRequest) {
>>>>>>> 0812b4c7be288aa3b57750fc9578111260fd0922
        UserResponseDTO userResponse = userService.createUser(createUserRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
    }

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> getAllUsersSimple(Pageable pageable) {
        Page<UserResponseDTO> users = userService.findAll(pageable);
        return ResponseEntity.ok(users);
    }
}
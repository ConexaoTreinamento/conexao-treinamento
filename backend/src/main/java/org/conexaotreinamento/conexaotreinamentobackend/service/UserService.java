package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateUserRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.UpdateUserRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    
    public UserResponseDTO createUser(CreateUserRequestDTO registerRequest) {
        if (userRepository.findByEmail(registerRequest.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já está em uso");
        }
        Role role;
        try {
            if (registerRequest.role() == null || registerRequest.role().isBlank()) {
                role = Role.ROLE_TRAINER;
            } else {
                role = Role.valueOf(registerRequest.role().toUpperCase());
            }
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Role inválido. Valores aceitos: ROLE_ADMIN, ROLE_TRAINER");
        }

        User user = new User(registerRequest.email(), passwordEncoder.encode(registerRequest.password()), role);
        User savedUser = userRepository.save(user);

        return UserResponseDTO.fromEntity(savedUser);
    }

    public List<UserResponseDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(UserResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Optional<UserResponseDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(UserResponseDTO::fromEntity);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado");
        }

        userRepository.deleteById(userId);
    }

    @Transactional
    public UserResponseDTO patch(UUID id, PatchUserRequestDTO request) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return null;
    }
}
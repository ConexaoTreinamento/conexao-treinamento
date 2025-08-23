package org.conexaotreinamento.conexaotreinamentobackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.api.dto.request.CreateUserRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.api.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.persistence.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.persistence.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Set<String> VALID_ROLES = Set.of("ROLE_ADMIN", "ROLE_TRAINER");

    @Transactional
    public UserResponseDTO createUser(CreateUserRequestDTO registerRequest) {
        if (userRepository.findByEmail(registerRequest.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já está em uso");
        }

        String roleInput = registerRequest.role() != null ? registerRequest.role().toUpperCase() : "ROLE_TRAINER";
        if (!VALID_ROLES.contains(roleInput)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Role inválido. Valores aceitos: ROLE_ADMIN, ROLE_TRAINER");
        }

        User user = new User(registerRequest.email(), passwordEncoder.encode(registerRequest.password()), roleInput);
        User savedUser = userRepository.save(user);

        return UserResponseDTO.fromEntity(savedUser, roleInput);
    }

    public List<UserResponseDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(user -> {
                    String role = determineUserRole(user);
                    return UserResponseDTO.fromEntity(user, role);
                })
                .collect(Collectors.toList());
    }

    public Optional<UserResponseDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    String role = determineUserRole(user);
                    return UserResponseDTO.fromEntity(user, role);
                });
    }

    @Transactional
    public void deleteUser(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado");
        }

        userRepository.deleteById(userId);
    }

    private String determineUserRole(User user) {
        return user.getRole();
    }
}
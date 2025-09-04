package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateUserRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchUserRoleRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    public UserResponseDTO createUser(CreateUserRequestDTO request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já está em uso");
        }

        User user = new User(request.email(), passwordEncoder.encode(request.password()), request.role());
        User savedUser = userRepository.save(user);

        return UserResponseDTO.fromEntity(savedUser);
    }

    public Page<UserResponseDTO> findAll(Pageable pageable) {
        Page<User> userPage = userRepository.findAllByDeletedAtIsNull(pageable);
        return userPage.map(UserResponseDTO::fromEntity);
    }

    public Optional<UserResponseDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(UserResponseDTO::fromEntity);
    }

    @Transactional
    public void delete(UUID id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.deactivate();
    }

    @Transactional
    public UserResponseDTO patch(UUID id, PatchUserRoleRequestDTO request) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (request.role() != null) {
            user.setRole(request.role());
        }
        return UserResponseDTO.fromEntity(user);
    }
}

package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ChangePasswordRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.UserCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchUserRoleRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponseDTO createUser(UserCreateRequestDTO request) {
        log.debug("Attempting to create user with email: {}", request.email());
        if (userRepository.findByEmail(request.email()).isPresent()) {
            log.warn("User creation failed - Email already in use: {}", request.email());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já está em uso");
        }

        User user = new User(request.email(), passwordEncoder.encode(request.password()), request.role());
        User savedUser = userRepository.save(user);
        
        log.info("User created successfully [ID: {}] - Email: {}, Role: {}", 
                savedUser.getId(), savedUser.getEmail(), savedUser.getRole());

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
        log.debug("Attempting to delete user [ID: {}]", id);
        
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        user.deactivate();
        log.info("User deactivated successfully [ID: {}] - Email: {}", id, user.getEmail());
    }

    @Transactional
    public UserResponseDTO restore(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (user.isActive()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already active");
        }
        
        // Verificar se já existe outro usuário ativo com o mesmo email
        if (userRepository.findByEmailAndDeletedAtIsNull(user.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Cannot restore user due to email conflict with another active user");
        }
        
        user.activate();
        User savedUser = userRepository.save(user);
        return UserResponseDTO.fromEntity(savedUser);
    }

    @Transactional
    public UserResponseDTO patch(UUID id, PatchUserRoleRequestDTO request) {
        log.debug("Attempting to patch user [ID: {}] with role: {}", id, request.role());
        
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Role oldRole = user.getRole();
        if (request.role() != null) {
            user.setRole(request.role());
            log.info("User role updated [ID: {}] - From: {} to: {}", id, oldRole, request.role());
        }
        
        return UserResponseDTO.fromEntity(user);
    }

    @Transactional
    public UserResponseDTO updateUserEmail(UUID userId, String newEmail) {
        if (newEmail == null || newEmail.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.getEmail().equals(newEmail)) {
            Optional<User> existingUser = userRepository.findByEmailAndDeletedAtIsNull(newEmail);
            if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
            }
            user.setEmail(newEmail);
        }

        User savedUser = userRepository.save(user);
        return UserResponseDTO.fromEntity(savedUser);
    }

    @Transactional
    public UserResponseDTO resetUserPassword(UUID userId, String newPassword) {
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.getRole().equals(Role.ROLE_TRAINER)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only trainers can have their password reset by this endpoint.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        User savedUser = userRepository.save(user);
        return UserResponseDTO.fromEntity(savedUser);
    }

    @Transactional
    public UserResponseDTO changeOwnPassword(UUID currentUserId, ChangePasswordRequestDTO request) {
        log.debug("Password change attempt for user [ID: {}]", currentUserId);
        
        if (!request.newPassword().equals(request.confirmPassword())) {
            log.warn("Password change failed - Password confirmation mismatch for user [ID: {}]", currentUserId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The new password and confirm password do not match.");
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            log.warn("Password change failed - Incorrect old password for user [ID: {}]", currentUserId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The old password is incorrect.");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        log.info("Password changed successfully for user [ID: {}]", currentUserId);

        return UserResponseDTO.fromEntity(user);
    }

    @Transactional
    public UserResponseDTO updateUserPassword(UUID userId, String newPassword) {
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.getRole().equals(Role.ROLE_TRAINER)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only trainers can have their password reset by this endpoint.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        User savedUser = userRepository.save(user);
        return UserResponseDTO.fromEntity(savedUser);
    }

}

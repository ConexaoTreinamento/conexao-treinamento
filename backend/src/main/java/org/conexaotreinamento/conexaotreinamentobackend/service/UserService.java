package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ChangePasswordRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchUserRoleRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.UserCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.BusinessException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ResourceNotFoundException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ValidationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing user accounts and authentication.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Creates a new user account.
     * 
     * @param request User creation request
     * @return Created user
     * @throws BusinessException if email already in use
     */
    public UserResponseDTO createUser(UserCreateRequestDTO request) {
        log.info("Creating user with email: {}", request.email());
        
        if (userRepository.findByEmail(request.email()).isPresent()) {
            log.warn("User creation failed - Email already in use: {}", request.email());
            throw new BusinessException("Email já está em uso", "EMAIL_IN_USE");
        }

        User user = new User(request.email(), passwordEncoder.encode(request.password()), request.role());
        User savedUser = userRepository.save(user);
        
        log.info("User created successfully [ID: {}] - Email: {}, Role: {}", 
                savedUser.getId(), savedUser.getEmail(), savedUser.getRole());

        return UserResponseDTO.fromEntity(savedUser);
    }

    /**
     * Retrieves all active users with pagination.
     * 
     * @param pageable Pagination parameters
     * @return Page of users
     */
    public Page<UserResponseDTO> findAll(Pageable pageable) {
        log.debug("Finding all users - Page: {}", pageable.getPageNumber());
        Page<User> userPage = userRepository.findAllByDeletedAtIsNull(pageable);
        log.debug("Found {} users", userPage.getTotalElements());
        return userPage.map(UserResponseDTO::fromEntity);
    }

    /**
     * Retrieves a user by email.
     * 
     * @param email User email
     * @return Optional containing user if found
     */
    public Optional<UserResponseDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(UserResponseDTO::fromEntity);
    }

    /**
     * Soft deletes a user.
     * 
     * @param id User ID
     * @throws ResourceNotFoundException if user not found
     */
    public void delete(UUID id) {
        log.info("Deleting user [ID: {}]", id);
        
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        
        user.deactivate();
        log.info("User deactivated successfully [ID: {}] - Email: {}", id, user.getEmail());
    }

    /**
     * Restores a soft-deleted user.
     * 
     * @param id User ID
     * @return Restored user
     * @throws ResourceNotFoundException if user not found
     * @throws BusinessException if user already active or email conflict
     */
    public UserResponseDTO restore(UUID id) {
        log.info("Restoring user [ID: {}]", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        
        if (user.isActive()) {
            throw new BusinessException("User is already active", "USER_ALREADY_ACTIVE");
        }
        
        // Check for email conflict
        if (userRepository.findByEmailAndDeletedAtIsNull(user.getEmail()).isPresent()) {
            throw new BusinessException(
                    "Cannot restore user due to email conflict with another active user",
                    "EMAIL_CONFLICT"
            );
        }
        
        user.activate();
        User savedUser = userRepository.save(user);
        log.info("User restored successfully [ID: {}]", id);
        return UserResponseDTO.fromEntity(savedUser);
    }

    /**
     * Updates user role.
     * 
     * @param id User ID
     * @param request Role update request
     * @return Updated user
     * @throws ResourceNotFoundException if user not found
     */
    public UserResponseDTO patch(UUID id, PatchUserRoleRequestDTO request) {
        log.info("Updating user role [ID: {}] to: {}", id, request.role());
        
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        
        Role oldRole = user.getRole();
        if (request.role() != null) {
            user.setRole(request.role());
            log.info("User role updated [ID: {}] - From: {} to: {}", id, oldRole, request.role());
        }
        
        return UserResponseDTO.fromEntity(user);
    }

    /**
     * Updates user email.
     * 
     * @param userId User ID
     * @param newEmail New email address
     * @return Updated user
     * @throws ValidationException if email is empty
     * @throws ResourceNotFoundException if user not found
     * @throws BusinessException if email already in use
     */
    public UserResponseDTO updateUserEmail(UUID userId, String newEmail) {
        if (newEmail == null || newEmail.trim().isEmpty()) {
            throw new ValidationException("Email is required");
        }

        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!user.getEmail().equals(newEmail)) {
            Optional<User> existingUser = userRepository.findByEmailAndDeletedAtIsNull(newEmail);
            if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
                throw new BusinessException("Email already in use", "EMAIL_IN_USE");
            }
            user.setEmail(newEmail);
        }

        User savedUser = userRepository.save(user);
        return UserResponseDTO.fromEntity(savedUser);
    }

    /**
     * Resets user password (for trainers only).
     * 
     * @param userId User ID
     * @param newPassword New password
     * @return Updated user
     * @throws ValidationException if password is empty or user is not a trainer
     * @throws ResourceNotFoundException if user not found
     */
    public UserResponseDTO resetUserPassword(UUID userId, String newPassword) {
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new ValidationException("Password is required");
        }

        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!user.getRole().equals(Role.ROLE_TRAINER)) {
            throw new ValidationException("Only trainers can have their password reset by this endpoint");
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        User savedUser = userRepository.save(user);
        return UserResponseDTO.fromEntity(savedUser);
    }

    /**
     * Changes user's own password.
     * 
     * @param currentUserId Current user ID
     * @param request Password change request
     * @return Updated user
     * @throws ValidationException if passwords don't match or old password incorrect
     * @throws ResourceNotFoundException if user not found
     */
    public UserResponseDTO changeOwnPassword(UUID currentUserId, ChangePasswordRequestDTO request) {
        log.info("Password change attempt for user [ID: {}]", currentUserId);
        
        if (!request.newPassword().equals(request.confirmPassword())) {
            log.warn("Password change failed - Password confirmation mismatch for user [ID: {}]", currentUserId);
            throw new ValidationException("The new password and confirm password do not match");
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", currentUserId));

        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            log.warn("Password change failed - Incorrect old password for user [ID: {}]", currentUserId);
            throw new ValidationException("The old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        log.info("Password changed successfully for user [ID: {}]", currentUserId);

        return UserResponseDTO.fromEntity(user);
    }

    /**
     * Updates user password (for trainers only).
     * 
     * @param userId User ID
     * @param newPassword New password
     * @return Updated user
     * @throws ValidationException if password is empty or user is not a trainer
     * @throws ResourceNotFoundException if user not found
     */
    public UserResponseDTO updateUserPassword(UUID userId, String newPassword) {
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new ValidationException("Password is required");
        }

        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!user.getRole().equals(Role.ROLE_TRAINER)) {
            throw new ValidationException("Only trainers can have their password reset by this endpoint");
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        User savedUser = userRepository.save(user);
        return UserResponseDTO.fromEntity(savedUser);
    }

}

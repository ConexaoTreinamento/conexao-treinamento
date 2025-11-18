package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.UserCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerListItemResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.TrainerMapper;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing Trainer entities and their associated Users.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TrainerService {

    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final TrainerMapper trainerMapper;
    private final TrainerValidationService validationService;

    /**
     * Creates a new trainer with associated user account.
     * 
     * @param request Trainer creation request
     * @return Created trainer details
     */
    public TrainerListItemResponseDTO create(TrainerCreateRequestDTO request) {
        log.info("Creating trainer: {} - {}", request.name(), request.email());
        
        // Validate email uniqueness
        validationService.validateEmailUniqueness(request.email());
        
        // Create associated user
        UserResponseDTO savedUser = userService.createUser(
                new UserCreateRequestDTO(request.email(), request.password(), Role.ROLE_TRAINER)
        );
        log.debug("User created for trainer [ID: {}] - Email: {}", savedUser.id(), request.email());
        
        // Create trainer
        Trainer trainer = trainerMapper.toEntity(request, savedUser.id());
        Trainer savedTrainer = trainerRepository.save(trainer);
        
        log.info("Trainer created successfully [ID: {}] - Name: {}", savedTrainer.getId(), savedTrainer.getName());
        
        return trainerRepository.findActiveTrainerProfileById(savedTrainer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Trainer", savedTrainer.getId()));
    }

    /**
     * Finds a trainer by ID.
     * 
     * @param id Trainer ID
     * @return Trainer details
     * @throws ResourceNotFoundException if trainer not found
     */
    public TrainerListItemResponseDTO findById(UUID id) {
        log.debug("Finding trainer by ID: {}", id);
        return trainerRepository.findActiveTrainerProfileById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer", id));
    }

    /**
     * Finds a trainer by their associated user ID.
     * 
     * @param userId User ID
     * @return Trainer details
     * @throws ResourceNotFoundException if trainer not found
     */
    public TrainerListItemResponseDTO findByUserId(UUID userId) {
        log.debug("Finding trainer by user ID: {}", userId);
        return trainerRepository.findTrainerByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer", "userId", userId));
    }

    /**
     * Finds all active trainers.
     * 
     * @return List of all trainers
     */
    public List<TrainerListItemResponseDTO> findAll() {
        log.debug("Finding all trainers");
        List<TrainerListItemResponseDTO> trainers = trainerRepository.findAllTrainerProfiles(true);
        log.debug("Found {} trainers", trainers.size());
        return trainers;
    }

    /**
     * Updates an existing trainer and associated user.
     * 
     * @param id Trainer ID
     * @param request Updated trainer data
     * @return Updated trainer details
     * @throws ResourceNotFoundException if trainer not found
     */
    public TrainerResponseDTO update(UUID id, TrainerCreateRequestDTO request) {
        log.info("Updating trainer [ID: {}]", id);
        
        Trainer trainer = findEntityById(id);
        
        // Validate email uniqueness if changed
        User user = userRepository.findById(trainer.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", trainer.getUserId()));
        
        if (!user.getEmail().equalsIgnoreCase(request.email())) {
            validationService.validateEmailUniqueness(request.email(), trainer.getUserId());
        }
        
        // Update user email
        UserResponseDTO updatedUser = userService.updateUserEmail(trainer.getUserId(), request.email());
        
        // Update password if provided
        if (request.hasPassword()) {
            userService.resetUserPassword(trainer.getUserId(), request.password());
        }
        
        // Update trainer fields
        trainerMapper.updateEntity(request, trainer);
        Trainer savedTrainer = trainerRepository.save(trainer);
        
        log.info("Trainer updated successfully [ID: {}]", id);
        
        return trainerMapper.toResponse(savedTrainer, updatedUser.email(), user.getCreatedAt());
    }

    /**
     * Soft deletes a trainer and associated user.
     * 
     * @param trainerId Trainer ID
     * @throws ResourceNotFoundException if trainer not found
     */
    public void delete(UUID trainerId) {
        log.info("Deleting trainer [ID: {}]", trainerId);
        
        Trainer trainer = findEntityById(trainerId);
        userService.delete(trainer.getUserId());
        
        log.info("Trainer deleted successfully [ID: {}]", trainerId);
    }

    /**
     * Resets the password for a trainer's user account.
     * 
     * @param trainerId Trainer ID
     * @param newPassword New password
     * @throws ResourceNotFoundException if trainer not found
     */
    public void resetPassword(UUID trainerId, String newPassword) {
        log.info("Resetting password for trainer [ID: {}]", trainerId);
        
        Trainer trainer = findEntityById(trainerId);
        userService.resetUserPassword(trainer.getUserId(), newPassword);
        
        log.info("Password reset successfully for trainer [ID: {}]", trainerId);
    }

    /**
     * Restores a soft-deleted trainer and associated user.
     * 
     * @param trainerId Trainer ID
     * @return Restored trainer details
     * @throws ResourceNotFoundException if trainer not found
     */
    public TrainerListItemResponseDTO restore(UUID trainerId) {
        log.info("Restoring trainer [ID: {}]", trainerId);
        
        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer", trainerId));
        
        userService.restore(trainer.getUserId());
        
        log.info("Trainer restored successfully [ID: {}]", trainerId);
        
        return trainerRepository.findActiveTrainerProfileById(trainerId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer", trainerId));
    }
    
    /**
     * Helper method to find a trainer entity by ID.
     * 
     * @param id Trainer ID
     * @return Trainer entity
     * @throws ResourceNotFoundException if not found
     */
    private Trainer findEntityById(UUID id) {
        return trainerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer", id));
    }
}

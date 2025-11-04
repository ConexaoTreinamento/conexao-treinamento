package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.UserCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerListItemResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrainerService {

    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public TrainerListItemResponseDTO create(TrainerCreateRequestDTO request) {
        log.debug("Attempting to create trainer with email: {}", request.email());
        if (trainerRepository.existsByEmailIgnoreCase(request.email())) {
            log.warn("Trainer creation failed - Email already exists: {}", request.email());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Trainer with this email already exists");
        }

        Trainer trainer = request.toEntity(savedUser.id());
        Trainer savedTrainer = trainerRepository.save(trainer);
        
        log.info("Trainer created successfully [ID: {}] - Name: {}, Email: {}", 
                savedTrainer.getId(), savedTrainer.getName(), request.email());

        return trainerRepository.findActiveTrainerProfileById(savedTrainer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Created trainer not found"));
    }

    public TrainerListItemResponseDTO findById(UUID id) {
        return trainerRepository.findActiveTrainerProfileById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found"));
    }

    public TrainerListItemResponseDTO findByUserId(UUID id) {
        return trainerRepository.findTrainerByUserId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found"));
    }

    public List<TrainerListItemResponseDTO> findAll() {
        return trainerRepository.findAllTrainerProfiles(true);
    }

    @Transactional
    public TrainerResponseDTO put(UUID id, TrainerCreateRequestDTO request) {
        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found"));

        // Always update the associated user's email (mandatory)
        UserResponseDTO updatedUser = userService.updateUserEmail(trainer.getUserId(), request.email());

        // Conditionally update password (optional)
        if (request.hasPassword()) {
            userService.resetUserPassword(trainer.getUserId(), request.password());
        }

        // Update trainer fields
        trainer.setName(request.name());
        trainer.setPhone(request.phone());
        trainer.setAddress(request.address());
        trainer.setBirthDate(request.birthDate());
        trainer.setSpecialties(request.specialties());
        trainer.setCompensationType(request.compensationType());

        Trainer savedTrainer = trainerRepository.save(trainer);

        // Buscar o User para obter o createdAt (joinDate)
        User user = userRepository.findById(trainer.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return TrainerResponseDTO.fromEntity(savedTrainer, updatedUser.email(), user.getCreatedAt());
    }

    @Transactional
    public void delete(UUID trainerId) {
        log.debug("Attempting to delete trainer [ID: {}]", trainerId);
        
        Optional<Trainer> trainer = trainerRepository.findById(trainerId);
        if (trainer.isPresent()) {
            log.info("Deleting trainer [ID: {}] - Name: {}", trainerId, trainer.get().getName());
            userService.delete(trainer.get().getUserId());
            log.info("Trainer deleted successfully [ID: {}]", trainerId);
        } else {
            log.warn("Trainer deletion attempted for non-existent trainer [ID: {}]", trainerId);
        }
    }

    @Transactional
    public void resetPassword(UUID trainerId, String newPassword) {
        log.debug("Attempting to reset password for trainer [ID: {}]", trainerId);
        
        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found"));

        UUID userId = trainer.getUserId();
        userService.resetUserPassword(userId, newPassword);
        
        log.info("Password reset successfully for trainer [ID: {}] - Name: {}", trainerId, trainer.getName());
    }
}

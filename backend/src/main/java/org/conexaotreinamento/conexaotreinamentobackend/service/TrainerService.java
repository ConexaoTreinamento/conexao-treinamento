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

@Service
@RequiredArgsConstructor
public class TrainerService {

    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public TrainerListItemResponseDTO create(TrainerCreateRequestDTO request) {
        if (trainerRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Trainer with this email already exists");
        }

        UserResponseDTO savedUser = userService.createUser(new UserCreateRequestDTO(request.email(), request.password(), Role.ROLE_TRAINER));

        Trainer trainer = request.toEntity(savedUser.id());
        Trainer savedTrainer = trainerRepository.save(trainer);

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
        Optional<Trainer> trainer = trainerRepository.findById(trainerId);
        trainer.ifPresent(value -> userService.delete(value.getUserId()));
    }

    @Transactional
    public void resetPassword(UUID trainerId, String newPassword) {
        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found"));

        UUID userId = trainer.getUserId();
        userService.resetUserPassword(userId, newPassword);
    }
}

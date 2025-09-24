package org.conexaotreinamento.conexaotreinamentobackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateTrainerDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateUserRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ListTrainersDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.ScheduledSessionRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrainerService {

    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ScheduledSessionRepository scheduledSessionRepository;

    @Transactional
    public ListTrainersDTO create(CreateTrainerDTO request) {
        if (trainerRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Trainer with this email already exists");
        }

        UserResponseDTO savedUser = userService.createUser(new CreateUserRequestDTO(request.email(), request.password(), Role.ROLE_TRAINER));

        Trainer trainer = request.toEntity(savedUser.id());
        Trainer savedTrainer = trainerRepository.save(trainer);

        return trainerRepository.findActiveTrainerProfileById(savedTrainer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Created trainer not found"));
    }

    public ListTrainersDTO findById(UUID id) {
    ListTrainersDTO dto = trainerRepository.findActiveTrainerProfileById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found"));
    // Replace hoursWorked with actual calculation based on attendance
    Integer hoursWorked = calculateTrainerHoursWorked(id);
    return new org.conexaotreinamento.conexaotreinamentobackend.dto.response.ListTrainersDTO(
        dto.id(), dto.name(), dto.email(), dto.phone(), dto.address(), dto.birthDate(), dto.specialties(),
        dto.compensationType(), dto.active(), dto.joinDate(), hoursWorked
    );
    }

    public List<ListTrainersDTO> findAll() {
        List<ListTrainersDTO> base = trainerRepository.findAllTrainerProfiles(true);
        // Map to replace hoursWorked with actual calculated value per trainer
        return base.stream().map(dto -> new org.conexaotreinamento.conexaotreinamentobackend.dto.response.ListTrainersDTO(
                dto.id(), dto.name(), dto.email(), dto.phone(), dto.address(), dto.birthDate(), dto.specialties(),
                dto.compensationType(), dto.active(), dto.joinDate(), calculateTrainerHoursWorked(dto.id())
        )).toList();
    }

    @Transactional
    public TrainerResponseDTO put(UUID id, CreateTrainerDTO request) {
        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found"));

        // Always update the associated user's email (mandatory)
        UserResponseDTO updatedUser = userService.updateUserEmail(trainer.getUserId(), request.email());

        // Conditionally update password (optional)
        if (request.hasPassword()) {
            userService.updateUserPassword(trainer.getUserId(), request.password());
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
        
        // Calculate actual hours worked based on sessions with at least one present student
        Integer hoursWorked = calculateTrainerHoursWorked(id);
        
        return TrainerResponseDTO.fromEntity(savedTrainer, updatedUser.email(), user.getCreatedAt(), hoursWorked);
    }

    @Transactional
    public void delete(UUID trainerId) {
        Optional<Trainer> trainer = trainerRepository.findById(trainerId);
        trainer.ifPresent(value -> userService.delete(value.getUserId()));
    }
    
    /**
     * Calculate trainer hours worked based on sessions with at least one present student
     */
    private Integer calculateTrainerHoursWorked(UUID trainerId) {
        return scheduledSessionRepository.calculateTrainerHoursWorked(trainerId);
    }
}

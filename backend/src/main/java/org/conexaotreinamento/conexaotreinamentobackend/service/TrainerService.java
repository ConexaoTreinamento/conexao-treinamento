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
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrainerService {

    private final TrainerRepository trainerRepository;

    private final UserService userService;

    @Transactional
    public TrainerResponseDTO create(CreateTrainerDTO request) {
        if (trainerRepository.existsByEmailIgnoreCaseAndDeletedAtIsNull(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Trainer with this email already exists");
        }

        UserResponseDTO savedUser = userService.createUser(new CreateUserRequestDTO(request.email(), request.password(), "ROLE_TRAINER"));

        Trainer trainer = request.toEntity(savedUser.id());
        Trainer savedTrainer = trainerRepository.save(trainer);

        return TrainerResponseDTO.fromEntity(savedTrainer);
    }

    public ListTrainersDTO findById(UUID id) {
        return trainerRepository.findActiveTrainerProfileById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found"));
    }

    public List<ListTrainersDTO> findAll() {
        return trainerRepository.findAllTrainerProfiles(true);
    }

    @Transactional
    public TrainerResponseDTO patch(UUID id, CreateTrainerDTO request) {
        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found"));

        if (request.name() != null) {
            trainer.setName(request.name());
        }
        
        if (request.email() != null) {
            if (!trainer.getEmail().equalsIgnoreCase(request.email()) &&
                trainerRepository.existsByEmailIgnoreCaseAndDeletedAtIsNull(request.email())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Trainer with this email already exists");
            }
            trainer.setEmail(request.email());
        }
        
        if (request.phone() != null) {
            trainer.setPhone(request.phone());
        }
        
        if (request.specialties() != null) {
            trainer.setSpecialties(request.specialties());
        }

        //Skipped patching compensationType to avoid extra complexity in hour calculation logic
        return TrainerResponseDTO.fromEntity(trainer);
    }

    @Transactional
    public void delete(UUID id) {
        userService.deleteUser(id);
    }
}

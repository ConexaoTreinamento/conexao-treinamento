package org.conexaotreinamento.conexaotreinamentobackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateTrainerDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrainerService {

    private final TrainerRepository trainerRepository;

    @Transactional
    public TrainerResponseDTO create(CreateTrainerDTO request) {
        if (trainerRepository.existsByEmailIgnoreCaseAndDeletedAtIsNull(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Trainer with this email already exists");
        }
        
        Trainer trainer = request.toEntity();
        Trainer savedTrainer = trainerRepository.save(trainer);
        //create user entity
        //save user entity

        return TrainerResponseDTO.fromEntity(savedTrainer);
    }

    public TrainerResponseDTO findById(UUID id) {
        Trainer trainer = trainerRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found"));

        return TrainerResponseDTO.fromEntity(trainer);
    }

    public List<TrainerResponseDTO> findAll() {
        return trainerRepository.findAllParsed();
    }

    @Transactional
    public TrainerResponseDTO patch(UUID id, CreateTrainerDTO request) {
        Trainer trainer = trainerRepository.findByIdAndDeletedAtIsNull(id)
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
        Trainer trainer = trainerRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found"));

        //getUser().deactivate();
        //trainer.deactivate();
        trainerRepository.save(trainer);
    }
}

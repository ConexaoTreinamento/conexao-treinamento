package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.BusinessException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for Trainer-specific validation logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TrainerValidationService {
    
    private final TrainerRepository trainerRepository;
    
    /**
     * Validates that email is unique among trainers.
     * 
     * @param email Email to check
     * @throws BusinessException if email already exists
     */
    public void validateEmailUniqueness(String email) {
        validateEmailUniqueness(email, null);
    }
    
    /**
     * Validates that email is unique among trainers, excluding a specific trainer.
     * 
     * @param email Email to check
     * @param excludeUserId User ID to exclude from check (for updates)
     * @throws BusinessException if email already exists
     */
    public void validateEmailUniqueness(String email, UUID excludeUserId) {
        log.debug("Validating trainer email uniqueness: {} (exclude user ID: {})", email, excludeUserId);
        
        boolean exists;
        if (excludeUserId == null) {
            exists = trainerRepository.existsByEmailIgnoreCase(email);
        } else {
            exists = trainerRepository.existsByEmailIgnoreCaseAndUserIdNot(email, excludeUserId);
        }
        
        if (exists) {
            log.warn("Email validation failed - Email already exists: {}", email);
            throw new BusinessException(
                    String.format("Trainer with email '%s' already exists", email),
                    "DUPLICATE_EMAIL"
            );
        }
    }
}


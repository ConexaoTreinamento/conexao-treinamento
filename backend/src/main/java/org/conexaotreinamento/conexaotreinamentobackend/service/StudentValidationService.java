package org.conexaotreinamento.conexaotreinamentobackend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.BusinessException;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service for Student-specific validation logic.
 * Keeps validation logic separate from business logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudentValidationService {
    
    private final StudentRepository studentRepository;
    
    /**
     * Validates that email is unique among active students.
     * 
     * @param email Email to check
     * @throws BusinessException if email already exists
     */
    public void validateEmailUniqueness(String email) {
        validateEmailUniqueness(email, null);
    }
    
    /**
     * Validates that email is unique among active students, excluding a specific student ID.
     * 
     * @param email Email to check
     * @param excludeId Student ID to exclude from check (for updates)
     * @throws BusinessException if email already exists
     */
    public void validateEmailUniqueness(String email, UUID excludeId) {
        log.debug("Validating email uniqueness: {} (exclude ID: {})", email, excludeId);
        
        boolean exists;
        if (excludeId == null) {
            exists = studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(email);
        } else {
            exists = studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNullAndIdNot(email, excludeId);
        }
        
        if (exists) {
            log.warn("Email validation failed - Email already exists: {}", email);
            throw new BusinessException(
                    String.format("Student with email '%s' already exists", email),
                    "DUPLICATE_EMAIL"
            );
        }
    }
}


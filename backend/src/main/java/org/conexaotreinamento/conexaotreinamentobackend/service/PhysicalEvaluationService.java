package org.conexaotreinamento.conexaotreinamentobackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PhysicalEvaluationRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.PhysicalEvaluationResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalEvaluation;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.PhysicalEvaluationMapper;
import org.conexaotreinamento.conexaotreinamentobackend.repository.PhysicalEvaluationRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing physical evaluations of students.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PhysicalEvaluationService {

    private final PhysicalEvaluationRepository evaluationRepository;
    private final StudentRepository studentRepository;
    private final PhysicalEvaluationMapper evaluationMapper;

    /**
     * Creates a new physical evaluation for a student.
     * 
     * @param studentId Student ID
     * @param request Physical evaluation data
     * @return Created evaluation
     * @throws ResourceNotFoundException if student not found
     */
    public PhysicalEvaluationResponseDTO create(UUID studentId, PhysicalEvaluationRequestDTO request) {
        log.info("Creating physical evaluation for student [ID: {}]", studentId);
        
        Student student = studentRepository.findByIdAndDeletedAtIsNull(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        
        PhysicalEvaluation evaluation = evaluationMapper.toEntity(request, student);
        PhysicalEvaluation savedEvaluation = evaluationRepository.save(evaluation);
        
        log.info("Physical evaluation created successfully [ID: {}] for student [ID: {}]", 
                savedEvaluation.getId(), studentId);
        return evaluationMapper.toResponse(savedEvaluation);
    }

    /**
     * Finds a physical evaluation by ID for a specific student.
     * 
     * @param studentId Student ID
     * @param evaluationId Evaluation ID
     * @return Physical evaluation
     * @throws ResourceNotFoundException if evaluation not found
     */
    public PhysicalEvaluationResponseDTO findById(UUID studentId, UUID evaluationId) {
        log.debug("Finding physical evaluation [ID: {}] for student [ID: {}]", evaluationId, studentId);
        PhysicalEvaluation evaluation = findEntityById(studentId, evaluationId);
        return evaluationMapper.toResponse(evaluation);
    }

    /**
     * Finds all physical evaluations for a specific student.
     * 
     * @param studentId Student ID
     * @return List of physical evaluations (ordered by date descending)
     * @throws ResourceNotFoundException if student not found
     */
    public List<PhysicalEvaluationResponseDTO> findAllByStudentId(UUID studentId) {
        log.debug("Finding all physical evaluations for student [ID: {}]", studentId);
        
        // Verify student exists
        studentRepository.findByIdAndDeletedAtIsNull(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        
        List<PhysicalEvaluation> evaluations = 
                evaluationRepository.findByStudentIdAndDeletedAtIsNullOrderByDateDesc(studentId);
        
        log.debug("Found {} physical evaluations for student [ID: {}]", evaluations.size(), studentId);
        return evaluations.stream()
                .map(evaluationMapper::toResponse)
                .toList();
    }

    /**
     * Updates an existing physical evaluation.
     * 
     * @param studentId Student ID
     * @param evaluationId Evaluation ID
     * @param request Updated evaluation data
     * @return Updated evaluation
     * @throws ResourceNotFoundException if evaluation not found
     */
    public PhysicalEvaluationResponseDTO update(UUID studentId, UUID evaluationId, 
                                                 PhysicalEvaluationRequestDTO request) {
        log.info("Updating physical evaluation [ID: {}] for student [ID: {}]", evaluationId, studentId);
        
        PhysicalEvaluation evaluation = findEntityById(studentId, evaluationId);
        evaluationMapper.updateEntity(request, evaluation);
        PhysicalEvaluation updatedEvaluation = evaluationRepository.save(evaluation);
        
        log.info("Physical evaluation updated successfully [ID: {}]", evaluationId);
        return evaluationMapper.toResponse(updatedEvaluation);
    }

    /**
     * Soft deletes a physical evaluation.
     * 
     * @param studentId Student ID
     * @param evaluationId Evaluation ID
     * @throws ResourceNotFoundException if evaluation not found
     */
    public void delete(UUID studentId, UUID evaluationId) {
        log.info("Deleting physical evaluation [ID: {}] for student [ID: {}]", evaluationId, studentId);
        
        PhysicalEvaluation evaluation = findEntityById(studentId, evaluationId);
        evaluation.deactivate();
        evaluationRepository.save(evaluation);
        
        log.info("Physical evaluation deleted successfully [ID: {}]", evaluationId);
    }

    /**
     * Finds an active physical evaluation entity by ID for a specific student.
     * 
     * @param studentId Student ID
     * @param evaluationId Evaluation ID
     * @return Physical evaluation entity
     * @throws ResourceNotFoundException if evaluation not found
     */
    private PhysicalEvaluation findEntityById(UUID studentId, UUID evaluationId) {
        return evaluationRepository
                .findByIdAndStudentIdAndDeletedAtIsNull(evaluationId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("PhysicalEvaluation", evaluationId));
    }
}


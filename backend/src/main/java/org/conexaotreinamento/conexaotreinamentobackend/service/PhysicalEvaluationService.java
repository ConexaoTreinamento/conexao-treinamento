package org.conexaotreinamento.conexaotreinamentobackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PhysicalEvaluationRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.PhysicalEvaluationResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalEvaluation;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.repository.PhysicalEvaluationRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhysicalEvaluationService {

    private final PhysicalEvaluationRepository evaluationRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public PhysicalEvaluationResponseDTO create(UUID studentId, PhysicalEvaluationRequestDTO request) {
        Student student = studentRepository.findByIdAndDeletedAtIsNull(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        // Calculate BMI: weight (kg) / (height (m))^2
        // Height comes in cm, so we need to convert to meters
        double heightInMeters = request.height() / 100.0;
        double bmi = request.weight() / (heightInMeters * heightInMeters);
        // Round to 1 decimal place
        bmi = Math.round(bmi * 10.0) / 10.0;

        // Date is set to today automatically
        PhysicalEvaluation evaluation = new PhysicalEvaluation(
                student,
                LocalDate.now(),
                request.weight(),
                request.height(),
                bmi
        );

        // Set circumferences
        if (request.circumferences() != null) {
            PhysicalEvaluation.Circumferences circumferences = new PhysicalEvaluation.Circumferences();
            circumferences.setRightArmRelaxed(request.circumferences().rightArmRelaxed());
            circumferences.setLeftArmRelaxed(request.circumferences().leftArmRelaxed());
            circumferences.setRightArmFlexed(request.circumferences().rightArmFlexed());
            circumferences.setLeftArmFlexed(request.circumferences().leftArmFlexed());
            circumferences.setWaist(request.circumferences().waist());
            circumferences.setAbdomen(request.circumferences().abdomen());
            circumferences.setHip(request.circumferences().hip());
            circumferences.setRightThigh(request.circumferences().rightThigh());
            circumferences.setLeftThigh(request.circumferences().leftThigh());
            circumferences.setRightCalf(request.circumferences().rightCalf());
            circumferences.setLeftCalf(request.circumferences().leftCalf());
            evaluation.setCircumferences(circumferences);
        }

        // Set subcutaneous folds
        if (request.subcutaneousFolds() != null) {
            PhysicalEvaluation.SubcutaneousFolds folds = new PhysicalEvaluation.SubcutaneousFolds();
            folds.setTriceps(request.subcutaneousFolds().triceps());
            folds.setThorax(request.subcutaneousFolds().thorax());
            folds.setSubaxillary(request.subcutaneousFolds().subaxillary());
            folds.setSubscapular(request.subcutaneousFolds().subscapular());
            folds.setAbdominal(request.subcutaneousFolds().abdominal());
            folds.setSuprailiac(request.subcutaneousFolds().suprailiac());
            folds.setThigh(request.subcutaneousFolds().thigh());
            evaluation.setSubcutaneousFolds(folds);
        }

        // Set diameters
        if (request.diameters() != null) {
            PhysicalEvaluation.Diameters diameters = new PhysicalEvaluation.Diameters();
            diameters.setUmerus(request.diameters().umerus());
            diameters.setFemur(request.diameters().femur());
            evaluation.setDiameters(diameters);
        }

        PhysicalEvaluation savedEvaluation = evaluationRepository.save(evaluation);
        return PhysicalEvaluationResponseDTO.fromEntity(savedEvaluation);
    }

    public PhysicalEvaluationResponseDTO findById(UUID studentId, UUID id) {
        PhysicalEvaluation evaluation = findActiveEvaluation(studentId, id);
        return PhysicalEvaluationResponseDTO.fromEntity(evaluation);
    }

    public List<PhysicalEvaluationResponseDTO> findAllByStudentId(UUID studentId) {
        // Verify student exists
        studentRepository.findByIdAndDeletedAtIsNull(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        List<PhysicalEvaluation> evaluations = evaluationRepository.findByStudentIdAndDeletedAtIsNullOrderByDateDesc(studentId);
        return evaluations.stream()
                .map(PhysicalEvaluationResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public PhysicalEvaluationResponseDTO update(
            UUID studentId,
            UUID id,
            PhysicalEvaluationRequestDTO request) {
        PhysicalEvaluation evaluation = findActiveEvaluation(studentId, id);

        // Recalculate BMI
        double heightInMeters = request.height() / 100.0;
        double bmi = request.weight() / (heightInMeters * heightInMeters);
        bmi = Math.round(bmi * 10.0) / 10.0;

        // Update basic fields (date is immutable - set on creation)
        evaluation.setWeight(request.weight());
        evaluation.setHeight(request.height());
        evaluation.setBmi(bmi);

        // Update circumferences
        if (request.circumferences() != null) {
            PhysicalEvaluation.Circumferences circumferences = new PhysicalEvaluation.Circumferences();
            circumferences.setRightArmRelaxed(request.circumferences().rightArmRelaxed());
            circumferences.setLeftArmRelaxed(request.circumferences().leftArmRelaxed());
            circumferences.setRightArmFlexed(request.circumferences().rightArmFlexed());
            circumferences.setLeftArmFlexed(request.circumferences().leftArmFlexed());
            circumferences.setWaist(request.circumferences().waist());
            circumferences.setAbdomen(request.circumferences().abdomen());
            circumferences.setHip(request.circumferences().hip());
            circumferences.setRightThigh(request.circumferences().rightThigh());
            circumferences.setLeftThigh(request.circumferences().leftThigh());
            circumferences.setRightCalf(request.circumferences().rightCalf());
            circumferences.setLeftCalf(request.circumferences().leftCalf());
            evaluation.setCircumferences(circumferences);
        }

        // Update subcutaneous folds
        if (request.subcutaneousFolds() != null) {
            PhysicalEvaluation.SubcutaneousFolds folds = new PhysicalEvaluation.SubcutaneousFolds();
            folds.setTriceps(request.subcutaneousFolds().triceps());
            folds.setThorax(request.subcutaneousFolds().thorax());
            folds.setSubaxillary(request.subcutaneousFolds().subaxillary());
            folds.setSubscapular(request.subcutaneousFolds().subscapular());
            folds.setAbdominal(request.subcutaneousFolds().abdominal());
            folds.setSuprailiac(request.subcutaneousFolds().suprailiac());
            folds.setThigh(request.subcutaneousFolds().thigh());
            evaluation.setSubcutaneousFolds(folds);
        }

        // Update diameters
        if (request.diameters() != null) {
            PhysicalEvaluation.Diameters diameters = new PhysicalEvaluation.Diameters();
            diameters.setUmerus(request.diameters().umerus());
            diameters.setFemur(request.diameters().femur());
            evaluation.setDiameters(diameters);
        }

        PhysicalEvaluation updatedEvaluation = evaluationRepository.save(evaluation);
        return PhysicalEvaluationResponseDTO.fromEntity(updatedEvaluation);
    }

    @Transactional
    public void delete(UUID studentId, UUID id) {
        PhysicalEvaluation evaluation = findActiveEvaluation(studentId, id);
        evaluation.deactivate();
        evaluationRepository.save(evaluation);
    }

    private PhysicalEvaluation findActiveEvaluation(UUID studentId, UUID evaluationId) {
        return evaluationRepository
                .findByIdAndStudentIdAndDeletedAtIsNull(evaluationId, studentId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Physical evaluation not found"));
    }
}


package org.conexaotreinamento.conexaotreinamentobackend.mapper;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PhysicalEvaluationRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.PhysicalEvaluationResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalEvaluation;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Mapper for converting between PhysicalEvaluation entities and DTOs.
 */
@Component
public class PhysicalEvaluationMapper {

    /**
     * Maps PhysicalEvaluation entity to PhysicalEvaluationResponseDTO.
     */
    public PhysicalEvaluationResponseDTO toResponse(PhysicalEvaluation entity) {
        return PhysicalEvaluationResponseDTO.fromEntity(entity);
    }

    /**
     * Maps PhysicalEvaluationRequestDTO to a new PhysicalEvaluation entity.
     * Automatically calculates BMI based on height and weight.
     */
    public PhysicalEvaluation toEntity(PhysicalEvaluationRequestDTO request, Student student) {
        // Calculate BMI: weight (kg) / (height (m))^2
        double heightInMeters = request.height() / 100.0;
        double bmi = request.weight() / (heightInMeters * heightInMeters);
        bmi = Math.round(bmi * 10.0) / 10.0; // Round to 1 decimal place

        PhysicalEvaluation evaluation = new PhysicalEvaluation(
                student,
                LocalDate.now(),
                request.weight(),
                request.height(),
                bmi
        );

        // Set circumferences if provided
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

        // Set subcutaneous folds if provided
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

        // Set diameters if provided
        if (request.diameters() != null) {
            PhysicalEvaluation.Diameters diameters = new PhysicalEvaluation.Diameters();
            diameters.setUmerus(request.diameters().umerus());
            diameters.setFemur(request.diameters().femur());
            evaluation.setDiameters(diameters);
        }

        return evaluation;
    }

    /**
     * Updates an existing PhysicalEvaluation entity with data from PhysicalEvaluationRequestDTO.
     */
    public void updateEntity(PhysicalEvaluationRequestDTO request, PhysicalEvaluation entity) {
        // Recalculate BMI
        double heightInMeters = request.height() / 100.0;
        double bmi = request.weight() / (heightInMeters * heightInMeters);
        bmi = Math.round(bmi * 10.0) / 10.0;

        entity.setWeight(request.weight());
        entity.setHeight(request.height());
        entity.setBmi(bmi);

        // Update circumferences
        if (request.circumferences() != null) {
            PhysicalEvaluation.Circumferences circumferences = entity.getCircumferences();
            if (circumferences == null) {
                circumferences = new PhysicalEvaluation.Circumferences();
                entity.setCircumferences(circumferences);
            }
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
        } else {
            entity.setCircumferences(null);
        }

        // Update subcutaneous folds
        if (request.subcutaneousFolds() != null) {
            PhysicalEvaluation.SubcutaneousFolds folds = entity.getSubcutaneousFolds();
            if (folds == null) {
                folds = new PhysicalEvaluation.SubcutaneousFolds();
                entity.setSubcutaneousFolds(folds);
            }
            folds.setTriceps(request.subcutaneousFolds().triceps());
            folds.setThorax(request.subcutaneousFolds().thorax());
            folds.setSubaxillary(request.subcutaneousFolds().subaxillary());
            folds.setSubscapular(request.subcutaneousFolds().subscapular());
            folds.setAbdominal(request.subcutaneousFolds().abdominal());
            folds.setSuprailiac(request.subcutaneousFolds().suprailiac());
            folds.setThigh(request.subcutaneousFolds().thigh());
        } else {
            entity.setSubcutaneousFolds(null);
        }

        // Update diameters
        if (request.diameters() != null) {
            PhysicalEvaluation.Diameters diameters = entity.getDiameters();
            if (diameters == null) {
                diameters = new PhysicalEvaluation.Diameters();
                entity.setDiameters(diameters);
            }
            diameters.setUmerus(request.diameters().umerus());
            diameters.setFemur(request.diameters().femur());
        } else {
            entity.setDiameters(null);
        }
    }
}


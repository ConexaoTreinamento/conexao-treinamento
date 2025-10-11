package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalEvaluation;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PhysicalEvaluationResponseDTO(
        UUID id,
        UUID studentId,
        LocalDate date,
        Double weight,
        Double height,
        Double bmi,
        CircumferencesDTO circumferences,
        SubcutaneousFoldsDTO subcutaneousFolds,
        DiametersDTO diameters,
        Instant createdAt,
        Instant updatedAt
) {
    public static PhysicalEvaluationResponseDTO fromEntity(PhysicalEvaluation evaluation) {
        return new PhysicalEvaluationResponseDTO(
                evaluation.getId(),
                evaluation.getStudent().getId(),
                evaluation.getDate(),
                evaluation.getWeight(),
                evaluation.getHeight(),
                evaluation.getBmi(),
                evaluation.getCircumferences() != null ? CircumferencesDTO.fromEntity(evaluation.getCircumferences()) : null,
                evaluation.getSubcutaneousFolds() != null ? SubcutaneousFoldsDTO.fromEntity(evaluation.getSubcutaneousFolds()) : null,
                evaluation.getDiameters() != null ? DiametersDTO.fromEntity(evaluation.getDiameters()) : null,
                evaluation.getCreatedAt(),
                evaluation.getUpdatedAt()
        );
    }

    public record CircumferencesDTO(
            Double rightArmRelaxed,
            Double leftArmRelaxed,
            Double rightArmFlexed,
            Double leftArmFlexed,
            Double waist,
            Double abdomen,
            Double hip,
            Double rightThigh,
            Double leftThigh,
            Double rightCalf,
            Double leftCalf
    ) {
        public static CircumferencesDTO fromEntity(PhysicalEvaluation.Circumferences circumferences) {
            return new CircumferencesDTO(
                    circumferences.getRightArmRelaxed(),
                    circumferences.getLeftArmRelaxed(),
                    circumferences.getRightArmFlexed(),
                    circumferences.getLeftArmFlexed(),
                    circumferences.getWaist(),
                    circumferences.getAbdomen(),
                    circumferences.getHip(),
                    circumferences.getRightThigh(),
                    circumferences.getLeftThigh(),
                    circumferences.getRightCalf(),
                    circumferences.getLeftCalf()
            );
        }
    }

    public record SubcutaneousFoldsDTO(
            Double triceps,
            Double thorax,
            Double subaxillary,
            Double subscapular,
            Double abdominal,
            Double suprailiac,
            Double thigh
    ) {
        public static SubcutaneousFoldsDTO fromEntity(PhysicalEvaluation.SubcutaneousFolds folds) {
            return new SubcutaneousFoldsDTO(
                    folds.getTriceps(),
                    folds.getThorax(),
                    folds.getSubaxillary(),
                    folds.getSubscapular(),
                    folds.getAbdominal(),
                    folds.getSuprailiac(),
                    folds.getThigh()
            );
        }
    }

    public record DiametersDTO(
            Double umerus,
            Double femur
    ) {
        public static DiametersDTO fromEntity(PhysicalEvaluation.Diameters diameters) {
            return new DiametersDTO(
                    diameters.getUmerus(),
                    diameters.getFemur()
            );
        }
    }
}


package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record PhysicalEvaluationRequestDTO(
        @NotNull @Positive Double weight,
        @NotNull @Positive Double height,
        @Valid CircumferencesDTO circumferences,
        @Valid SubcutaneousFoldsDTO subcutaneousFolds,
        @Valid DiametersDTO diameters
) {
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
    ) {}

    public record SubcutaneousFoldsDTO(
            Double triceps,
            Double thorax,
            Double subaxillary,
            Double subscapular,
            Double abdominal,
            Double suprailiac,
            Double thigh
    ) {}

    public record DiametersDTO(
            Double umerus,
            Double femur
    ) {}
}


package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment;

public record PhysicalImpairmentRequestDTO(
        @NotNull PhysicalImpairment.PhysicalImpairmentType type,
        @NotBlank @Size(max = 255) String name,
        String observations
) {}

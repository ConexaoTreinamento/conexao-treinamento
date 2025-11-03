package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionParticipantPresenceRequestDTO {
    @JsonProperty("isPresent")
    private boolean isPresent;
    private String notes; // optional attendance notes
}

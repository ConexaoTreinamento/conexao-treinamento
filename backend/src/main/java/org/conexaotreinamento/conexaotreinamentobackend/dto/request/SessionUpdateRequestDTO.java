package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.entity.SessionParticipant;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionUpdateRequestDTO {
    private List<SessionParticipant> participants;
    private String notes;
    // Optional per-session override fields
    private UUID trainerId;
    private Integer maxParticipants;
    private Boolean canceled;
    private String room;
    private String equipment;
}

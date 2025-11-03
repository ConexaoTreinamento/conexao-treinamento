package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionCancelRequestDTO {
    private boolean isCancel; // true = cancel, false = restore
    private String reason;  // optional reason (future use)
}

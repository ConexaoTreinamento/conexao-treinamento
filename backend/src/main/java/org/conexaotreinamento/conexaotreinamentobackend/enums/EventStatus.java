package org.conexaotreinamento.conexaotreinamentobackend.enums;

public enum EventStatus {
    OPEN("Aberto"),
    FULL("Lotado"),
    CANCELLED("Cancelado");

    private final String displayName;

    EventStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

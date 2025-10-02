package org.conexaotreinamento.conexaotreinamentobackend.enums;

/**
 * Enum representing the different commitment statuses for student series-level commitments.
 * Used in the event sourcing architecture to track student participation intentions.
 */
public enum CommitmentStatus {
    /**
     * Student is committed to attending all sessions in the series ("book all sessions")
     */
    ATTENDING,
    
    /**
     * Student is explicitly not participating in the series
     */
    NOT_ATTENDING,
    
    /**
     * Student has tentative commitment ("this and following" or conditional participation)
     */
    TENTATIVE
}

package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AnamnesisRepository extends JpaRepository<Anamnesis, UUID> {
}

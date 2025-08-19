package org.conexaotreinamento.conexaotreinamentobackend.persistence.repository;

import org.conexaotreinamento.conexaotreinamentobackend.persistence.entity.Role;
import org.conexaotreinamento.conexaotreinamentobackend.persistence.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(RoleName name);
}
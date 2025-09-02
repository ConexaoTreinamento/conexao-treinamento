package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
//Delete and create  task
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    Optional<User> findByIdAndDeletedAtIsNull(UUID id);

}

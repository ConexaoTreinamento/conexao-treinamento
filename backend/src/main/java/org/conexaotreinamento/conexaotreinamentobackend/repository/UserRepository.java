package org.conexaotreinamento.conexaotreinamentobackend.repository;

import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    Optional<User> findByIdAndDeletedAtIsNull(UUID id);
        
    Page<User> findAllByDeletedAtIsNull(Pageable pageable);
    
    Optional<User> findByEmailAndDeletedAtIsNull(String email);
    
    boolean existsByIdAndDeletedAtIsNull(UUID id);
    
    boolean existsByEmailAndDeletedAtIsNull(String email);
}

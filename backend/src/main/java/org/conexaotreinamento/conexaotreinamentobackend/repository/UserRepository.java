package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    Optional<User> findByIdAndDeletedAtIsNull(UUID id);
<<<<<<< HEAD

    
    List<User> findAllByDeletedAtIsNull();
=======
        
    Page<User> findAllByDeletedAtIsNull(Pageable pageable);
>>>>>>> 4a4a4a0e65274bff2ef97451958a72647b054001
    
    Optional<User> findByEmailAndDeletedAtIsNull(String email);
    
    boolean existsByIdAndDeletedAtIsNull(UUID id);
    
    boolean existsByEmailAndDeletedAtIsNull(String email);
}

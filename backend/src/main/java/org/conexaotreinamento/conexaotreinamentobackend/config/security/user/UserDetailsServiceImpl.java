package org.conexaotreinamento.conexaotreinamentobackend.config.security.user;

import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + email));
        return new UserDetailsImpl(user);
    }

    /*
     * O método loadUserByUsername() é um método da interface UserDetailsService, 
     * é usado para carregar os detalhes do usuário com base no nome de usuário fornecido. 
     * Esse método é chamado automaticamente pelo Spring durante o processo de autenticação,
     * é responsável por retornar um UserDetails com base no nome de usuário fornecido.
     */
}

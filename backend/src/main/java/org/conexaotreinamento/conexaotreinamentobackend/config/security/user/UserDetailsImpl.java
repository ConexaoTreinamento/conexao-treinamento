package org.conexaotreinamento.conexaotreinamentobackend.config.security.user;

import java.util.Collection;
import java.util.UUID;
import java.util.stream.Collectors;

import org.conexaotreinamento.conexaotreinamentobackend.persistence.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.Getter;

@Getter
public class UserDetailsImpl implements UserDetails {

    private UUID id;
    private String username;
    private String password;
    private User user; // Mantemos a referência para acessar roles

    public UserDetailsImpl(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.password = user.getPassword();
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        /*
         * Este método converte a lista de papéis (roles) associados ao usuário
         * em uma coleção de GrantedAuthorities, que é a forma que o Spring Security
         * usa para representar papéis. Isso é feito mapeando cada papel para um
         * novo SimpleGrantedAuthority, que é uma implementação simples de
         * GrantedAuthority
         */
        return user.getRoles()
                .stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

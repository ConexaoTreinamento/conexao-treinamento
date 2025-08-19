package org.conexaotreinamento.conexaotreinamentobackend.config.security.jwt;

import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.config.security.user.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Serviço responsável pela geração de tokens JWT
 * Usa o JwtEncoder do Spring Security OAuth2 Resource Server
 */
@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtEncoder jwtEncoder;
    
    // Tempo de expiração do token em horas (padrão: 24 horas)
    @Value("${app.jwt.expiration-hours:24}")
    private long jwtExpirationHours;

    public String generateToken(Authentication authentication) {
        // Extrai os detalhes do usuário autenticado
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Extrai as roles/authorities do usuário
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
        
        // Define o momento atual e expiração
        Instant now = Instant.now();
        Instant expiration = now.plus(jwtExpirationHours, ChronoUnit.HOURS);
        
        // Constrói as claims (dados) do JWT
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("conexao-treinamento")
                .issuedAt(now)
                .expiresAt(expiration)
                .subject(userDetails.getUsername())
                .claim("email", userDetails.getUsername())
                .claim("roles", roles)
                .build();
        
        // Gera e retorna o token JWT
        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}
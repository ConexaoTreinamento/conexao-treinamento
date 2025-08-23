package org.conexaotreinamento.conexaotreinamentobackend.config.security.jwt;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.conexaotreinamento.conexaotreinamentobackend.config.security.user.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtService {

    /*
        - Trocar o KEY ID para PROD
        - EXEMPLOS:
        - UUID v4: 3f0f3e9e-2c9a-4d27-9a50-2f8d1b5b6b9c
        - ULID: 01J5Z2S8QH8GQ2N19NX52Z9R1P
        - Versionado por período: hs256-2025-08-v1
        - Com nome do domínio/sistema + versão: conexao-auth-hs256-2025Q3-v2
        - Curto e legível (ainda único no seu contexto): auth-2025-08-23-v3
     */
    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;

    @Value("${app.jwt.expiration-hours}")
    private long expirationHours;

    public String generateToken(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Instant now = Instant.now();
        Instant expiration = now.plus(expirationHours, ChronoUnit.HOURS);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("conexao-treinamento")
                .issuedAt(now)
                .expiresAt(expiration)
                .subject(userDetails.getUser().getEmail())
                .claim("userId", userDetails.getUser().getId())
                .claim("role", userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .findFirst()
                        .orElse("ROLE_TRAINER"))
                .build();

        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256)
                .keyId("app-key")
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public String generateRefreshToken(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Instant now = Instant.now();
        Instant expiration = now.plus(7, ChronoUnit.DAYS); // 7 dias

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("conexao-treinamento")
                .issuedAt(now)
                .expiresAt(expiration)
                .subject(userDetails.getUsername())
                .claim("type", "refresh")
                .build();

        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256)
                .keyId("app-key")
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public String extractUsername(String token) {
        Jwt jwt = jwtDecoder.decode(token);
        return jwt.getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            jwtDecoder.decode(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}

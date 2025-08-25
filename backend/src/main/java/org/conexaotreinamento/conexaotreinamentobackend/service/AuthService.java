package org.conexaotreinamento.conexaotreinamentobackend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.conexaotreinamento.conexaotreinamentobackend.config.security.jwt.JwtService;
import org.conexaotreinamento.conexaotreinamentobackend.config.security.user.UserDetailsImpl;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.LoginRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.JwtResponseDTO;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public JwtResponseDTO login(LoginRequestDTO loginRequest) {
        log.debug("Starting login process for: {}", loginRequest.email());

        log.debug("Attempting to authenticate user...");
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password()));
        log.debug("Authentication successful!");

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        log.debug("UserDetails obtained: {}", userDetails.getUsername());
        log.debug("Authorities: {}", userDetails.getAuthorities());

        log.debug("Generating JWT token...");
        String token = jwtService.generateToken(authentication);
        log.debug("Token generated successfully! Size: {}", token.length());

        return new JwtResponseDTO(userDetails.getId(), token);
    }

    public void logout() {
        log.debug("Clearing security context for logout");
        SecurityContextHolder.clearContext();
    }
}
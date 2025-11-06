package org.conexaotreinamento.conexaotreinamentobackend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.conexaotreinamento.conexaotreinamentobackend.config.security.jwt.JwtService;
import org.conexaotreinamento.conexaotreinamentobackend.config.security.user.UserDetailsImpl;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.LoginRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.JwtResponseDTO;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    public JwtResponseDTO login(LoginRequestDTO loginRequest) {
        log.debug("Starting login process for: {}", loginRequest.email());

        try {
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
            log.debug("Token generated successfully!");

            return new JwtResponseDTO(userDetails.getId(), token, false);
            
        } catch (CredentialsExpiredException e) {
            log.warn("User {} attempted login with expired password", loginRequest.email());
            
            UserDetailsImpl userDetails = (UserDetailsImpl) userDetailsService.loadUserByUsername(loginRequest.email());
            
            if (!passwordEncoder.matches(loginRequest.password(), userDetails.getPassword())) {
                log.error("Invalid password for user with expired credentials: {}", loginRequest.email());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }
            
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, 
                    null, 
                    userDetails.getAuthorities()
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            log.debug("Generating JWT token for user with expired password...");
            String token = jwtService.generateToken(authentication);
            log.debug("Token generated successfully!");
            
            return new JwtResponseDTO(userDetails.getId(), token, true);
        }
    }

    public void logout() {
        log.debug("Clearing security context for logout");
        SecurityContextHolder.clearContext();
    }
}
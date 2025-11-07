package org.conexaotreinamento.conexaotreinamentobackend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.LoginRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.JwtResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @SecurityRequirements()
    public ResponseEntity<JwtResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        log.info("Login attempt for user: {}", loginRequest.email());
        JwtResponseDTO response = authService.login(loginRequest);
        log.info("Login successful for user: {} [ID: {}]", loginRequest.email(), response.id());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        log.info("Logout request received");
        authService.logout();
        log.info("Logout completed successfully");
        return ResponseEntity.ok("Logout realizado com sucesso!");
    }
}
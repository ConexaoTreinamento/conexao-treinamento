package org.conexaotreinamento.conexaotreinamentobackend.controller;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.LoginRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.JwtResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.AuthService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for authentication operations.
 * Handles user login and logout.
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @SecurityRequirements() // Public endpoint - no security required
    @Operation(
        summary = "User login", 
        description = "Authenticates a user and returns a JWT access token"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(
            responseCode = "401", 
            description = "Invalid credentials", 
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Invalid input", 
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    public ResponseEntity<JwtResponseDTO> login(
            @Valid @RequestBody @Parameter(description = "Login credentials") LoginRequestDTO loginRequest) {
        
        log.info("Login attempt for user: {}", loginRequest.email());
        JwtResponseDTO response = authService.login(loginRequest);
        log.info("Login successful for user: {} [ID: {}]", loginRequest.email(), response.id());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(
        summary = "User logout", 
        description = "Logs out the current user by clearing their security context"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Logout successful")
    })
    public ResponseEntity<Void> logout() {
        log.info("Logout request received");
        authService.logout();
        log.info("Logout completed successfully");
        return ResponseEntity.noContent().build();
    }
}
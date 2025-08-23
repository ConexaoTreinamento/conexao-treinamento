package org.conexaotreinamento.conexaotreinamentobackend.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.api.dto.request.LoginRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.api.dto.response.JwtResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.config.security.user.UserDetailsImpl;
import org.conexaotreinamento.conexaotreinamentobackend.config.security.jwt.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
/**
 * Controller responsável pelos endpoints de autenticação
 * Usa OAuth2 Resource Server para geração e validação de tokens
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    /**
     * Endpoint de login
     * Autentica o usuário e retorna um token JWT
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        System.out.println("[DEBUG] Iniciando processo de login para: " + loginRequest.email());
        
        try {
            System.out.println("[DEBUG] Tentando autenticar usuário...");
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
            );
            System.out.println("[DEBUG] Autenticação bem-sucedida!");
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            System.out.println("[DEBUG] UserDetails obtido: " + userDetails.getUsername());
            System.out.println("[DEBUG] Authorities: " + userDetails.getAuthorities());
            
            System.out.println("[DEBUG] Gerando token JWT...");
            String token = jwtService.generateToken(authentication);
            System.out.println("[DEBUG] Token gerado com sucesso! Tamanho: " + token.length());
            
            return ResponseEntity.ok(new JwtResponseDTO(userDetails.getId(), token));
        } catch (BadCredentialsException e) {
            System.out.println("[DEBUG] Erro de credenciais: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        } catch (Exception e) {
            System.out.println("[DEBUG] Erro interno: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno do servidor");
        }
    }

    /**
     * Endpoint de logout
     * Limpa o contexto de segurança (o token continua válido até expirar)
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // Limpa o contexto de segurança
        SecurityContextHolder.clearContext();

        // Nota: Com JWT stateless, o token continua válido até expirar
        // Para invalidação real, seria necessário uma blacklist de tokens
        return ResponseEntity.ok("Logout realizado com sucesso!");
    }
}

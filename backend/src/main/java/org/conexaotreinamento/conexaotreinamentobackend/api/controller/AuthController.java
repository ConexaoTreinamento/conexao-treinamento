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
        try {
            // Autentica o usuário usando email e senha
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.username(),
                            loginRequest.password()));

            // Define a autenticação no contexto de segurança
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Gera o token JWT usando o serviço OAuth2
            String jwt = jwtService.generateToken(authentication);

            // Extrai informações do usuário autenticado
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            // Retorna o token e informações do usuário
            return ResponseEntity.ok(new JwtResponseDTO(userDetails.getId(), jwt));
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        } catch (Exception ex) {
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

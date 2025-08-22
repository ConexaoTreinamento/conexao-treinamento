package org.conexaotreinamento.conexaotreinamentobackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Habilita anotações @PreAuthorize, @PostAuthorize
public class SecurityConfig {
    
    // Chave secreta para assinar e validar tokens JWT
    @Value("${app.jwt.secret:mySecretKeyForJWTTokenGeneration123456789}")
    private String jwtSecret;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        // Cria uma chave secreta a partir da string configurada
        SecretKeySpec secretKey = new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA256");
        // Retorna o encoder usando a chave secreta imutável
        return new NimbusJwtEncoder(new ImmutableSecret<>(secretKey));
    }
 
    @Bean
    public JwtDecoder jwtDecoder() {
        // Cria uma chave secreta a partir da string configurada
        SecretKeySpec secretKey = new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA256");
        // Retorna o decoder usando a mesma chave secreta
        return NimbusJwtDecoder.withSecretKey(secretKey).build();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // Desabilita CSRF pois usaremos JWT (stateless)
                .csrf(AbstractHttpConfigurer::disable)
                
                // Configura sessões como STATELESS (sem estado no servidor)
                // Cada request deve conter o token JWT
                .sessionManagement(session -> 
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                // Configuração de autorização de requests
                .authorizeHttpRequests(authorize -> authorize
                    // Endpoints públicos - não requerem autenticação
                    .requestMatchers("/auth/**").permitAll() // Login, logout
                    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll() // Swagger
                    
                    // Endpoints específicos por role
                    .requestMatchers("/api/admin/**").hasRole("ADMIN") // Apenas admins
                    .requestMatchers("/api/professor/**").hasRole("PROFESSOR") // Apenas professores
                    
                    // Todos os outros endpoints requerem autenticação
                    .anyRequest().authenticated()
                )
                
                // Configuração OAuth2 Resource Server para JWT
                .oauth2ResourceServer(oauth2 -> oauth2
                    // Configura para usar JWT como tipo de token
                    .jwt(jwt -> jwt
                        // Usa o JwtDecoder configurado acima
                        .decoder(jwtDecoder())
                        // Converte claims do JWT em authorities do Spring Security
                        .jwtAuthenticationConverter(jwtAuthenticationConverter())
                    )
                )
                
                .build();
    }

    @Bean
    public org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter jwtAuthenticationConverter() {
        var converter = new org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter();
        
        // Configura como extrair authorities (roles) do JWT
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            // Extrai a claim 'roles' do JWT
            var roles = jwt.getClaimAsStringList("roles");
            
            // Converte para o formato de authorities do Spring Security
            return roles.stream()
                    .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority(role))
                    .collect(java.util.stream.Collectors.toList());
        });
        
        return converter;
    }
}
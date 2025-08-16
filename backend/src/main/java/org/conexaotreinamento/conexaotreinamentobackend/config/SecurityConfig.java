package org.conexaotreinamento.conexaotreinamentobackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // Often disabled for APIs, but keep if needed
                .authorizeHttpRequests(authorize -> authorize
                        // Allow unauthenticated access to OpenAPI documentation endpoints
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-resources/**",
                                "/swagger-ui.html",
                                "/webjars/**"
                        ).permitAll()
                        // TODO: implement authentication
                        .anyRequest().permitAll()
                );
        // .httpBasic(withDefaults()); // Or .formLogin(withDefaults()); depending on your auth type

        return http.build();
    }
}

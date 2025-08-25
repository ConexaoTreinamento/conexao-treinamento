package org.conexaotreinamento.conexaotreinamentobackend.config;

import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

@TestConfiguration
@ActiveProfiles("test")
public class TestSecurityConfig {

    @Bean
    @Primary
    PasswordEncoder testPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    public static User createTestUser(String email, String password, Role role) {
        return new User(email, password, role);
    }

    public static User createTestAdmin() {
        return createTestUser("admin@test.com", "password123", Role.ROLE_ADMIN);
    }

    public static User createTestTrainer() {
        return createTestUser("trainer@test.com", "password123", Role.ROLE_TRAINER);
    }
}
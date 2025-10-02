package org.conexaotreinamento.conexaotreinamentobackend.config;

import lombok.extern.slf4j.Slf4j;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AdministratorRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Slf4j
@Configuration
public class DataSeeder {

    // No EntityManager usage; prefer repository methods to avoid streaming/ResultSet issues during startup

    @Bean
    public CommandLineRunner seedRootAdmin(UserRepository userRepository,
                                           AdministratorRepository administratorRepository,
                                           PasswordEncoder passwordEncoder) {
        return args -> {
            final String email = "admin@conexaotreinamento.com";
            final String rawPassword = "admin";

            // Seed User (for authentication)
            try {
                Optional<User> existingUserAny = userRepository.findByEmail(email);
                if (existingUserAny.isEmpty()) {
                    User user = new User(email, passwordEncoder.encode(rawPassword), Role.ROLE_ADMIN);
                    userRepository.save(user);
                    log.info("Seeded root User with ROLE_ADMIN: {}", email);
                } else {
                    User user = existingUserAny.get();
                    boolean updated = false;
                    if (user.isInactive()) {
                        user.activate();
                        updated = true;
                    }
                    if (user.getRole() != Role.ROLE_ADMIN) {
                        user.setRole(Role.ROLE_ADMIN);
                        updated = true;
                    }
                    // Ensure password is set to the known default for initial bootstrap only
                    // Note: In production, rotate this password after first login.
                    user.setPassword(passwordEncoder.encode(rawPassword));
                    updated = true;
                    if (updated) {
                        userRepository.save(user);
                        log.info("Ensured root User active with ROLE_ADMIN: {}", email);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to seed root User: {}", e.getMessage());
            }

            // Seed Administrator profile (for admin management screens)
            try {
                boolean adminActiveExists = administratorRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(email);
                if (!adminActiveExists) {
                    Administrator existing = administratorRepository.findByEmailIgnoringCase(email).orElse(null);
                    if (existing == null) {
                        Administrator admin = new Administrator("Root", "Admin", email, passwordEncoder.encode(rawPassword));
                        administratorRepository.save(admin);
                        log.info("Seeded Administrator profile for: {}", email);
                    } else {
                        if (existing.isInactive()) {
                            existing.activate();
                        }
                        existing.setFirstName("Root");
                        existing.setLastName("Admin");
                        existing.setEmail(email);
                        existing.setPassword(passwordEncoder.encode(rawPassword));
                        administratorRepository.save(existing);
                        log.info("Restored/Updated Administrator profile for: {}", email);
                    }
                }
            } catch (DataIntegrityViolationException dive) {
                log.warn("Administrator seed skipped due to unique constraint: {}", dive.getMessage());
            } catch (Exception e) {
                log.warn("Failed to seed Administrator profile: {}", e.getMessage());
            }
        };
    }
}

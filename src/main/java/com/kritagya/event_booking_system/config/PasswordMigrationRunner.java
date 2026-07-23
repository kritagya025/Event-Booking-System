package com.kritagya.event_booking_system.config;

import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * One-time migration that detects plain-text passwords in the database
 * and re-hashes them with BCrypt. Safe to run repeatedly — already-hashed
 * passwords (starting with "$2a$") are skipped.
 */
@Component
public class PasswordMigrationRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordMigrationRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        List<User> users = userRepository.findAll();
        int migrated = 0;

        for (User user : users) {
            String password = user.getPassword();
            if (password != null && !password.startsWith("$2a$") && !password.startsWith("$2b$")) {
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
                migrated++;
            }
        }

        if (migrated > 0) {
            System.out.println("[PasswordMigration] Migrated " + migrated + " user(s) from plain-text to BCrypt.");
        }
    }
}

package com.kritagya.event_booking_system.repository;

import com.kritagya.event_booking_system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailVerificationToken(String token);

    Optional<User> findByPasswordResetToken(String token);

    long countByEmailVerifiedTrue();

    @org.springframework.data.jpa.repository.Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    java.util.List<Object[]> countUsersByRole();
}

package com.kritagya.event_booking_system.auth;

import com.kritagya.event_booking_system.entity.RefreshToken;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.enums.Role;
import com.kritagya.event_booking_system.exception.DuplicateEmailException;
import com.kritagya.event_booking_system.exception.ResourceNotFoundException;
import com.kritagya.event_booking_system.exception.TokenExpiredException;
import com.kritagya.event_booking_system.repository.RefreshTokenRepository;
import com.kritagya.event_booking_system.repository.UserRepository;
import com.kritagya.event_booking_system.security.CustomUserDetails;
import com.kritagya.event_booking_system.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final com.kritagya.event_booking_system.service.EmailService emailService;
    private final com.kritagya.event_booking_system.logging.AuditLogger auditLogger;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpiration;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       com.kritagya.event_booking_system.service.EmailService emailService,
                       com.kritagya.event_booking_system.logging.AuditLogger auditLogger) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.auditLogger = auditLogger;
    }

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        String verificationToken = UUID.randomUUID().toString();

        User user = new User(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhone(),
                Role.CUSTOMER
        );
        user.setEmailVerified(false);
        user.setEmailVerificationToken(verificationToken);

        User savedUser = userRepository.save(user);

        // Send email verification email
        emailService.sendEmailVerificationEmail(savedUser, verificationToken);

        String verificationLink = baseUrl + "/api/auth/verify-email?token=" + verificationToken;
        log.info("Email verification link for {}: {}", savedUser.getEmail(), verificationLink);

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = createRefreshToken(savedUser).getToken();

        return new AuthResponseDTO(accessToken, refreshToken, savedUser.getEmail(), savedUser.getRole().name());
    }

    @Transactional
    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (!user.isEmailVerified()) {
            auditLogger.logLogin(request.getEmail(), false, "UNVERIFIED_EMAIL");
            throw new DisabledException("Email not verified. Please verify your email before logging in.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String accessToken = jwtUtil.generateToken(userDetails);

        // Revoke old refresh tokens and create a new one
        refreshTokenRepository.revokeAllByUser(userDetails.getUser());
        String refreshToken = createRefreshToken(userDetails.getUser()).getToken();

        auditLogger.logLogin(request.getEmail(), true, "SUCCESS");

        return new AuthResponseDTO(
                accessToken,
                refreshToken,
                userDetails.getUsername(),
                userDetails.getUser().getRole().name()
        );
    }

    @Transactional
    public AuthResponseDTO refreshToken(RefreshTokenRequestDTO request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found"));

        if (refreshToken.isRevoked()) {
            throw new TokenExpiredException("Refresh token has been revoked");
        }

        if (refreshToken.isExpired()) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new TokenExpiredException("Refresh token has expired");
        }

        User user = refreshToken.getUser();
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String newAccessToken = jwtUtil.generateToken(userDetails);

        // Rotate refresh token
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        String newRefreshToken = createRefreshToken(user).getToken();

        return new AuthResponseDTO(newAccessToken, newRefreshToken, user.getEmail(), user.getRole().name());
    }

    @Transactional
    public void logout(RefreshTokenRequestDTO request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found"));

        refreshTokenRepository.revokeAllByUser(refreshToken.getUser());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        // Always return success to prevent email enumeration
        if (user == null) {
            log.warn("Forgot password requested for non-existent email: {}", request.getEmail());
            return;
        }

        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // Send password reset email
        emailService.sendPasswordResetEmail(user, resetToken);

        String resetLink = baseUrl + "/api/auth/reset-password?token=" + resetToken;
        log.info("Password reset link for {}: {}", user.getEmail(), resetLink);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequestDTO request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid password reset token"));

        if (user.getPasswordResetTokenExpiry() == null ||
                LocalDateTime.now().isAfter(user.getPasswordResetTokenExpiry())) {
            throw new TokenExpiredException("Password reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        // Revoke all refresh tokens for security
        refreshTokenRepository.revokeAllByUser(user);
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email verification token"));

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        userRepository.save(user);
    }

    private RefreshToken createRefreshToken(User user) {
        long refreshExpirationMs = refreshExpiration;
        LocalDateTime expiryDate = LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000);

        RefreshToken refreshToken = new RefreshToken(
                UUID.randomUUID().toString(),
                expiryDate,
                user
        );

        return refreshTokenRepository.save(refreshToken);
    }
}

package com.kritagya.event_booking_system.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    public static final String INSECURE_DEFAULT_SECRET = "dGhpcyBpcyBhIHZlcnkgc2VjcmV0IGtleSBmb3Igand0IGV2ZW50IGJvb2tpbmc=";
    private static final byte[] INSECURE_DEFAULT_BYTES = "this is a very secret key for jwt event booking".getBytes(StandardCharsets.UTF_8);
    private static final int MIN_KEY_BYTES = 32; // 256 bits for HMAC-SHA256

    @Value("${jwt.secret:}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private long expiration;

    private SecretKey signingKey;

    public JwtUtil() {
    }

    public JwtUtil(String secret, long expiration) {
        this.secret = secret;
        this.expiration = expiration;
        validateAndInitializeKey();
    }

    @PostConstruct
    public void validateAndInitializeKey() {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret is not configured or is empty. Please configure the JWT_SECRET environment variable.");
        }

        String trimmedSecret = secret.trim();

        if (INSECURE_DEFAULT_SECRET.equals(trimmedSecret)) {
            throw new IllegalStateException("Configured JWT secret matches the known insecure public default secret. A secure, unique JWT_SECRET must be configured.");
        }

        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(trimmedSecret);
        } catch (Exception e) {
            throw new IllegalStateException("Configured JWT secret is not a valid Base64-encoded string.");
        }

        if (Arrays.equals(keyBytes, INSECURE_DEFAULT_BYTES)) {
            throw new IllegalStateException("Configured JWT secret matches the known insecure public default secret. A secure, unique JWT_SECRET must be configured.");
        }

        if (keyBytes.length < MIN_KEY_BYTES) {
            throw new IllegalStateException("Configured JWT secret does not meet the minimum cryptographic key length for HMAC-SHA256 (requires at least 256 bits / 32 bytes, found " + (keyBytes.length * 8) + " bits).");
        }

        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", userDetails.getAuthorities().iterator().next().getAuthority());
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private SecretKey getSigningKey() {
        if (this.signingKey == null) {
            validateAndInitializeKey();
        }
        return this.signingKey;
    }

    // Helpers for test isolation
    void setSecret(String secret) {
        this.secret = secret;
        this.signingKey = null;
    }

    void setExpiration(long expiration) {
        this.expiration = expiration;
    }
}

package com.kritagya.event_booking_system.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtSecretValidationTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(JwtUtil.class);

    private static final String VALID_TEST_KEY = "dGhpcyBpcyBhIHRlc3Qgc2VjcmV0IGtleSBmb3IgdGVzdGluZyBwdXJwb3Nlcw==";

    @Test
    @DisplayName("1. Production startup fails when JWT_SECRET is missing")
    void testStartupFailsWhenSecretIsMissing() {
        contextRunner.run(context -> {
            assertThat(context).hasFailed();
            assertThat(context.getStartupFailure())
                    .hasRootCauseInstanceOf(IllegalStateException.class)
                    .rootCause()
                    .hasMessageContaining("JWT secret is not configured or is empty");
        });
    }

    @Test
    @DisplayName("2. Production startup fails when JWT_SECRET is blank")
    void testStartupFailsWhenSecretIsBlank() {
        contextRunner
                .withPropertyValues("jwt.secret=   ", "jwt.expiration=86400000")
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .hasRootCauseInstanceOf(IllegalStateException.class)
                            .rootCause()
                            .hasMessageContaining("JWT secret is not configured or is empty");
                });
    }

    @Test
    @DisplayName("3. Production startup fails with the previously known public default secret")
    void testStartupFailsWithPublicDefaultSecret() {
        contextRunner
                .withPropertyValues(
                        "jwt.secret=" + JwtUtil.INSECURE_DEFAULT_SECRET,
                        "jwt.expiration=86400000"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .hasRootCauseInstanceOf(IllegalStateException.class)
                            .rootCause()
                            .hasMessageContaining("matches the known insecure public default secret");
                });
    }

    @Test
    @DisplayName("4a. Production startup fails with an invalid Base64 key")
    void testStartupFailsWithInvalidBase64Key() {
        contextRunner
                .withPropertyValues(
                        "jwt.secret=!!!not-base64-encoded-secret!!!",
                        "jwt.expiration=86400000"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .hasRootCauseInstanceOf(IllegalStateException.class)
                            .rootCause()
                            .hasMessageContaining("not a valid Base64-encoded string");
                });
    }

    @Test
    @DisplayName("4b. Production startup fails with an undersized key (< 256 bits)")
    void testStartupFailsWithUndersizedKey() {
        // "c2hvcnQ=" decodes to "short" (5 bytes / 40 bits)
        contextRunner
                .withPropertyValues(
                        "jwt.secret=c2hvcnQ=",
                        "jwt.expiration=86400000"
                )
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                            .hasRootCauseInstanceOf(IllegalStateException.class)
                            .rootCause()
                            .hasMessageContaining("requires at least 256 bits");
                });
    }

    @Test
    @DisplayName("5. Production startup succeeds with a valid test-only key")
    void testStartupSucceedsWithValidKey() {
        contextRunner
                .withPropertyValues(
                        "jwt.secret=" + VALID_TEST_KEY,
                        "jwt.expiration=86400000"
                )
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(JwtUtil.class);
                });
    }

    @Test
    @DisplayName("6. Existing JWT generation and validation still work")
    void testJwtGenerationAndValidation() {
        JwtUtil jwtUtil = new JwtUtil(VALID_TEST_KEY, 86400000L);

        UserDetails userDetails = new User(
                "user@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        String token = jwtUtil.generateToken(userDetails);
        assertThat(token).isNotNull().isNotBlank();

        assertThat(jwtUtil.extractEmail(token)).isEqualTo("user@example.com");
        assertThat(jwtUtil.isTokenValid(token, userDetails)).isTrue();

        Date expiration = jwtUtil.extractExpiration(token);
        assertThat(expiration).isAfter(new Date());

        // Validate mismatching user fails
        UserDetails otherUser = new User(
                "other@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );
        assertThat(jwtUtil.isTokenValid(token, otherUser)).isFalse();
    }

    @Test
    @DisplayName("7. Direct instantiation startup validation checks without Spring context")
    void testDirectInstantiationValidation() {
        assertThatThrownBy(() -> new JwtUtil(null, 86400000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT secret is not configured or is empty");

        assertThatThrownBy(() -> new JwtUtil("", 86400000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT secret is not configured or is empty");

        assertThatThrownBy(() -> new JwtUtil("   ", 86400000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT secret is not configured or is empty");

        assertThatThrownBy(() -> new JwtUtil(JwtUtil.INSECURE_DEFAULT_SECRET, 86400000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("matches the known insecure public default secret");

        assertThatThrownBy(() -> new JwtUtil("invalid-base64?!", 86400000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not a valid Base64-encoded string");

        assertThatThrownBy(() -> new JwtUtil("c2hvcnQ=", 86400000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("requires at least 256 bits");
    }
}


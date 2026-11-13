package com.kritagya.event_booking_system.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kritagya.event_booking_system.auth.*;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    private AuthResponseDTO authResponseDTO;

    @BeforeEach
    void setUp() {
        authResponseDTO = new AuthResponseDTO("access-token", "refresh-token", "test@example.com", "CUSTOMER");
    }

    @Test
    @DisplayName("POST /api/auth/register should register a user and set cookies")
    void register_Success() throws Exception {
        RegisterRequestDTO dto = new RegisterRequestDTO("Test", "User", "test@example.com", "password123", "1234567890");

        when(authService.register(any(RegisterRequestDTO.class))).thenReturn(authResponseDTO);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"))
                .andExpect(header().exists(HttpHeaders.SET_COOKIE));
    }

    @Test
    @DisplayName("POST /api/auth/login should authenticate a user and set cookies")
    void login_Success() throws Exception {
        LoginRequestDTO dto = new LoginRequestDTO("test@example.com", "password123");

        when(authService.login(any(LoginRequestDTO.class))).thenReturn(authResponseDTO);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("access-token"))
                .andExpect(header().exists(HttpHeaders.SET_COOKIE));
    }

    @Test
    @DisplayName("POST /api/auth/refresh should refresh access token from body")
    void refresh_Success() throws Exception {
        RefreshTokenRequestDTO dto = new RefreshTokenRequestDTO("refresh-token");

        when(authService.refreshToken(any(RefreshTokenRequestDTO.class))).thenReturn(authResponseDTO);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("access-token"));
    }

    @Test
    @DisplayName("POST /api/auth/refresh with HttpOnly cookie fallback should succeed")
    void refresh_WithCookieFallback_Success() throws Exception {
        when(authService.refreshToken(any(RefreshTokenRequestDTO.class))).thenReturn(authResponseDTO);

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie("refreshToken", "cookie-refresh-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("access-token"));
    }

    @Test
    @DisplayName("POST /api/auth/refresh without token or cookie should return 400 Bad Request")
    void refresh_MissingToken_ReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Refresh token is required"));
    }

    @Test
    @DisplayName("POST /api/auth/logout should clear cookies and revoke token")
    void logout_Success() throws Exception {
        doNothing().when(authService).logout(any(RefreshTokenRequestDTO.class));

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(new Cookie("refreshToken", "logout-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"))
                .andExpect(header().exists(HttpHeaders.SET_COOKIE));
    }

    @Test
    @DisplayName("POST /api/auth/forgot-password should initiate password reset")
    void forgotPassword_Success() throws Exception {
        ForgotPasswordRequestDTO dto = new ForgotPasswordRequestDTO("test@example.com");
        doNothing().when(authService).forgotPassword(any(ForgotPasswordRequestDTO.class));

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If the email exists, a password reset link has been sent"));
    }

    @Test
    @DisplayName("POST /api/auth/reset-password should reset user password")
    void resetPassword_Success() throws Exception {
        ResetPasswordRequestDTO dto = new ResetPasswordRequestDTO("valid-token", "newpassword123");
        doNothing().when(authService).resetPassword(any(ResetPasswordRequestDTO.class));

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset successfully"));
    }

    @Test
    @DisplayName("GET /api/auth/verify-email should verify account email")
    void verifyEmail_Success() throws Exception {
        doNothing().when(authService).verifyEmail("verify-token-123");

        mockMvc.perform(get("/api/auth/verify-email")
                        .param("token", "verify-token-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Email verified successfully"));
    }
}

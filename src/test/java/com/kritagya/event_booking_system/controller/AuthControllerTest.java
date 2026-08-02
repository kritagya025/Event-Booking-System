package com.kritagya.event_booking_system.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kritagya.event_booking_system.auth.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
    @DisplayName("POST /api/auth/register should register a user")
    void register_Success() throws Exception {
        RegisterRequestDTO dto = new RegisterRequestDTO("Test", "User", "test@example.com", "password123", "1234567890");

        when(authService.register(any(RegisterRequestDTO.class))).thenReturn(authResponseDTO);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));
    }

    @Test
    @DisplayName("POST /api/auth/login should authenticate a user")
    void login_Success() throws Exception {
        LoginRequestDTO dto = new LoginRequestDTO("test@example.com", "password123");

        when(authService.login(any(LoginRequestDTO.class))).thenReturn(authResponseDTO);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("access-token"));
    }

    @Test
    @DisplayName("POST /api/auth/refresh should refresh access token")
    void refresh_Success() throws Exception {
        RefreshTokenRequestDTO dto = new RefreshTokenRequestDTO("refresh-token");

        when(authService.refreshToken(any(RefreshTokenRequestDTO.class))).thenReturn(authResponseDTO);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("access-token"));
    }
}

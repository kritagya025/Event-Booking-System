package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.admin.*;
import com.kritagya.event_booking_system.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    private AdminDashboardDTO dashboardDTO;

    @BeforeEach
    void setUp() {
        dashboardDTO = new AdminDashboardDTO(
                100L, 20L, 150L,
                BigDecimal.valueOf(15000), BigDecimal.valueOf(1200),
                5L, 2L, Collections.emptyList()
        );
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/dashboard should return dashboard DTO for ADMIN")
    void getDashboard_AdminSuccess() throws Exception {
        when(adminService.getDashboard()).thenReturn(dashboardDTO);

        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(100))
                .andExpect(jsonPath("$.totalEvents").value(20))
                .andExpect(jsonPath("$.totalBookings").value(150))
                .andExpect(jsonPath("$.totalRevenue").value(15000));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("GET /api/admin/dashboard should return 403 Forbidden for CUSTOMER")
    void getDashboard_CustomerForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/analytics/revenue should return revenue analytics for ADMIN")
    void getRevenueAnalytics_AdminSuccess() throws Exception {
        RevenueAnalyticsDTO analyticsDTO = new RevenueAnalyticsDTO(
                BigDecimal.valueOf(15000), BigDecimal.valueOf(1200), BigDecimal.valueOf(5000),
                Map.of("MUSIC", BigDecimal.valueOf(10000)), Map.of("2026-08-02", BigDecimal.valueOf(1200))
        );
        when(adminService.getRevenueAnalytics()).thenReturn(analyticsDTO);

        mockMvc.perform(get("/api/admin/analytics/revenue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRevenue").value(15000));
    }
}

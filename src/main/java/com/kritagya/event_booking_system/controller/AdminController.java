package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.admin.*;
import com.kritagya.event_booking_system.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Endpoints for platform administration, system diagnostics, and business reports")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard overview metrics", description = "Provides high-level KPIs including user counts, event metrics, bookings, and revenue figures.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dashboard KPIs returned"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        AdminDashboardDTO dashboard = adminService.getDashboard();
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/analytics/revenue")
    @Operation(summary = "Get revenue analytics", description = "Provides breakdown of total platform revenue, today revenue, and category earnings.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Revenue analytics returned"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    public ResponseEntity<RevenueAnalyticsDTO> getRevenueAnalytics() {
        RevenueAnalyticsDTO analytics = adminService.getRevenueAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/bookings")
    @Operation(summary = "Get booking analytics", description = "Provides booking counts and breakdown by booking lifecycle status.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking analytics returned"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    public ResponseEntity<BookingAnalyticsDTO> getBookingAnalytics() {
        BookingAnalyticsDTO analytics = adminService.getBookingAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/statistics/users")
    @Operation(summary = "Get user account statistics", description = "Provides user growth numbers and role distribution.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User statistics returned"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    public ResponseEntity<UserStatisticsDTO> getUserStatistics() {
        UserStatisticsDTO stats = adminService.getUserStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/statistics/events")
    @Operation(summary = "Get event catalog statistics", description = "Provides breakdown of published, draft, upcoming, and category counts.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Event statistics returned"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    public ResponseEntity<EventStatisticsDTO> getEventStatistics() {
        EventStatisticsDTO stats = adminService.getEventStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/reports")
    @Operation(summary = "Get comprehensive audit report", description = "Compiles all operational metrics, user statistics, and revenue KPIs into a consolidated report.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comprehensive audit report returned"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    public ResponseEntity<ReportsDTO> getReports() {
        ReportsDTO report = adminService.getFullReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/system-health")
    @Operation(summary = "Get system diagnostics and JVM metrics", description = "Provides real-time system performance diagnostics, uptime, JVM memory, and active thread metrics.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "System health diagnostics retrieved"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    public ResponseEntity<SystemHealthDTO> getSystemHealth() {
        SystemHealthDTO health = adminService.getSystemHealth();
        return ResponseEntity.ok(health);
    }
}

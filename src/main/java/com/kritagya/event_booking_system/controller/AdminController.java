package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.admin.*;
import com.kritagya.event_booking_system.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        AdminDashboardDTO dashboard = adminService.getDashboard();
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/analytics/revenue")
    public ResponseEntity<RevenueAnalyticsDTO> getRevenueAnalytics() {
        RevenueAnalyticsDTO analytics = adminService.getRevenueAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/bookings")
    public ResponseEntity<BookingAnalyticsDTO> getBookingAnalytics() {
        BookingAnalyticsDTO analytics = adminService.getBookingAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/statistics/users")
    public ResponseEntity<UserStatisticsDTO> getUserStatistics() {
        UserStatisticsDTO stats = adminService.getUserStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/statistics/events")
    public ResponseEntity<EventStatisticsDTO> getEventStatistics() {
        EventStatisticsDTO stats = adminService.getEventStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/reports")
    public ResponseEntity<ReportsDTO> getReports() {
        ReportsDTO report = adminService.getFullReport();
        return ResponseEntity.ok(report);
    }
}

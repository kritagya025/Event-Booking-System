package com.kritagya.event_booking_system.dto.admin;

import java.time.LocalDateTime;

public class ReportsDTO {

    private LocalDateTime generatedAt;
    private AdminDashboardDTO dashboardSummary;
    private RevenueAnalyticsDTO revenueAnalytics;
    private BookingAnalyticsDTO bookingAnalytics;
    private UserStatisticsDTO userStatistics;
    private EventStatisticsDTO eventStatistics;

    public ReportsDTO() {
    }

    public ReportsDTO(LocalDateTime generatedAt, AdminDashboardDTO dashboardSummary,
                      RevenueAnalyticsDTO revenueAnalytics, BookingAnalyticsDTO bookingAnalytics,
                      UserStatisticsDTO userStatistics, EventStatisticsDTO eventStatistics) {
        this.generatedAt = generatedAt;
        this.dashboardSummary = dashboardSummary;
        this.revenueAnalytics = revenueAnalytics;
        this.bookingAnalytics = bookingAnalytics;
        this.userStatistics = userStatistics;
        this.eventStatistics = eventStatistics;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public AdminDashboardDTO getDashboardSummary() {
        return dashboardSummary;
    }

    public void setDashboardSummary(AdminDashboardDTO dashboardSummary) {
        this.dashboardSummary = dashboardSummary;
    }

    public RevenueAnalyticsDTO getRevenueAnalytics() {
        return revenueAnalytics;
    }

    public void setRevenueAnalytics(RevenueAnalyticsDTO revenueAnalytics) {
        this.revenueAnalytics = revenueAnalytics;
    }

    public BookingAnalyticsDTO getBookingAnalytics() {
        return bookingAnalytics;
    }

    public void setBookingAnalytics(BookingAnalyticsDTO bookingAnalytics) {
        this.bookingAnalytics = bookingAnalytics;
    }

    public UserStatisticsDTO getUserStatistics() {
        return userStatistics;
    }

    public void setUserStatistics(UserStatisticsDTO userStatistics) {
        this.userStatistics = userStatistics;
    }

    public EventStatisticsDTO getEventStatistics() {
        return eventStatistics;
    }

    public void setEventStatistics(EventStatisticsDTO eventStatistics) {
        this.eventStatistics = eventStatistics;
    }
}

package com.kritagya.event_booking_system.dto.admin;

import com.kritagya.event_booking_system.dto.EventResponseDTO;

import java.math.BigDecimal;
import java.util.List;

public class AdminDashboardDTO {

    private long totalUsers;
    private long totalEvents;
    private long totalBookings;
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private long upcomingEventsCount;
    private long cancelledEventsCount;
    private List<EventResponseDTO> popularEvents;

    public AdminDashboardDTO() {
    }

    public AdminDashboardDTO(long totalUsers, long totalEvents, long totalBookings,
                             BigDecimal totalRevenue, BigDecimal todayRevenue,
                             long upcomingEventsCount, long cancelledEventsCount,
                             List<EventResponseDTO> popularEvents) {
        this.totalUsers = totalUsers;
        this.totalEvents = totalEvents;
        this.totalBookings = totalBookings;
        this.totalRevenue = totalRevenue;
        this.todayRevenue = todayRevenue;
        this.upcomingEventsCount = upcomingEventsCount;
        this.cancelledEventsCount = cancelledEventsCount;
        this.popularEvents = popularEvents;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getTodayRevenue() {
        return todayRevenue;
    }

    public void setTodayRevenue(BigDecimal todayRevenue) {
        this.todayRevenue = todayRevenue;
    }

    public long getUpcomingEventsCount() {
        return upcomingEventsCount;
    }

    public void setUpcomingEventsCount(long upcomingEventsCount) {
        this.upcomingEventsCount = upcomingEventsCount;
    }

    public long getCancelledEventsCount() {
        return cancelledEventsCount;
    }

    public void setCancelledEventsCount(long cancelledEventsCount) {
        this.cancelledEventsCount = cancelledEventsCount;
    }

    public List<EventResponseDTO> getPopularEvents() {
        return popularEvents;
    }

    public void setPopularEvents(List<EventResponseDTO> popularEvents) {
        this.popularEvents = popularEvents;
    }
}

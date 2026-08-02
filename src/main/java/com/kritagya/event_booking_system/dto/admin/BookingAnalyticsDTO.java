package com.kritagya.event_booking_system.dto.admin;

import java.util.Map;

public class BookingAnalyticsDTO {

    private long totalBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private double cancellationRate;
    private Map<String, Long> bookingsByStatus;

    public BookingAnalyticsDTO() {
    }

    public BookingAnalyticsDTO(long totalBookings, long confirmedBookings, long cancelledBookings,
                               double cancellationRate, Map<String, Long> bookingsByStatus) {
        this.totalBookings = totalBookings;
        this.confirmedBookings = confirmedBookings;
        this.cancelledBookings = cancelledBookings;
        this.cancellationRate = cancellationRate;
        this.bookingsByStatus = bookingsByStatus;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getConfirmedBookings() {
        return confirmedBookings;
    }

    public void setConfirmedBookings(long confirmedBookings) {
        this.confirmedBookings = confirmedBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public double getCancellationRate() {
        return cancellationRate;
    }

    public void setCancellationRate(double cancellationRate) {
        this.cancellationRate = cancellationRate;
    }

    public Map<String, Long> getBookingsByStatus() {
        return bookingsByStatus;
    }

    public void setBookingsByStatus(Map<String, Long> bookingsByStatus) {
        this.bookingsByStatus = bookingsByStatus;
    }
}

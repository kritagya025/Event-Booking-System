package com.kritagya.event_booking_system.dto;

import java.math.BigDecimal;

public class EventAnalyticsDTO {

    private Long eventId;
    private String eventName;
    private Long viewCount;
    private Long bookingCount;
    private BigDecimal revenue;
    private Double occupancyPercentage;
    private Double averageRating;

    public EventAnalyticsDTO() {
    }

    public EventAnalyticsDTO(Long eventId, String eventName, Long viewCount, Long bookingCount,
                             BigDecimal revenue, Double occupancyPercentage, Double averageRating) {
        this.eventId = eventId;
        this.eventName = eventName;
        this.viewCount = viewCount;
        this.bookingCount = bookingCount;
        this.revenue = revenue;
        this.occupancyPercentage = occupancyPercentage;
        this.averageRating = averageRating;
    }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public Long getViewCount() { return viewCount; }
    public void setViewCount(Long viewCount) { this.viewCount = viewCount; }

    public Long getBookingCount() { return bookingCount; }
    public void setBookingCount(Long bookingCount) { this.bookingCount = bookingCount; }

    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }

    public Double getOccupancyPercentage() { return occupancyPercentage; }
    public void setOccupancyPercentage(Double occupancyPercentage) { this.occupancyPercentage = occupancyPercentage; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
}

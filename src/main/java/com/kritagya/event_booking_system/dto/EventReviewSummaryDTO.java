package com.kritagya.event_booking_system.dto;

import org.springframework.data.domain.Page;

public class EventReviewSummaryDTO {

    private Long eventId;
    private Double averageRating;
    private Long totalReviews;
    private Page<ReviewResponseDTO> reviews;

    public EventReviewSummaryDTO() {
    }

    public EventReviewSummaryDTO(Long eventId, Double averageRating, Long totalReviews, Page<ReviewResponseDTO> reviews) {
        this.eventId = eventId;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
        this.reviews = reviews;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Long totalReviews) {
        this.totalReviews = totalReviews;
    }

    public Page<ReviewResponseDTO> getReviews() {
        return reviews;
    }

    public void setReviews(Page<ReviewResponseDTO> reviews) {
        this.reviews = reviews;
    }
}

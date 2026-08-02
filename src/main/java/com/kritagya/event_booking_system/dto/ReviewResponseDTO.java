package com.kritagya.event_booking_system.dto;

import java.time.LocalDateTime;

public class ReviewResponseDTO {

    private Long id;
    private Integer rating;
    private String comment;
    private Long userId;
    private String userName;
    private Long eventId;
    private LocalDateTime createdAt;

    public ReviewResponseDTO() {
    }

    public ReviewResponseDTO(Long id, Integer rating, String comment, Long userId, String userName, Long eventId, LocalDateTime createdAt) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.userId = userId;
        this.userName = userName;
        this.eventId = eventId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

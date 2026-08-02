package com.kritagya.event_booking_system.dto;

import java.time.LocalDateTime;

public class SeatUpdateDTO {

    private Long eventId;
    private Long seatId;
    private String status;
    private Integer availableSeats;
    private LocalDateTime timestamp;

    public SeatUpdateDTO() {
    }

    public SeatUpdateDTO(Long eventId, Long seatId, String status, Integer availableSeats, LocalDateTime timestamp) {
        this.eventId = eventId;
        this.seatId = seatId;
        this.status = status;
        this.availableSeats = availableSeats;
        this.timestamp = timestamp;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getSeatId() {
        return seatId;
    }

    public void setSeatId(Long seatId) {
        this.seatId = seatId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(Integer availableSeats) {
        this.availableSeats = availableSeats;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

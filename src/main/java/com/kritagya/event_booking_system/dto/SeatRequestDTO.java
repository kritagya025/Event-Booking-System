package com.kritagya.event_booking_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SeatRequestDTO {

    @NotBlank(message = "Seat number is required")
    private String seatNumber;

    @NotBlank(message = "Row number is required")
    private String rowNumber;

    @NotBlank(message = "Seat type is required")
    private String seatType;

    @NotBlank(message = "Seat status is required")
    private String status;

    @NotNull(message = "Venue ID is required")
    private Long venueId;

    public SeatRequestDTO() {

    }

    public SeatRequestDTO(String seatNumber, String rowNumber, String seatType, String status, Long venueId) {
        this.seatNumber = seatNumber;
        this.rowNumber = rowNumber;
        this.seatType = seatType;
        this.status = status;
        this.venueId = venueId;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getRowNumber() {
        return rowNumber;
    }

    public void setRowNumber(String rowNumber) {
        this.rowNumber = rowNumber;
    }

    public String getSeatType() {
        return seatType;
    }

    public void setSeatType(String seatType) {
        this.seatType = seatType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }
}

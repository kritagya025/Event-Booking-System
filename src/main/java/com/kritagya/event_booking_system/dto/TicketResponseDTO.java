package com.kritagya.event_booking_system.dto;

import java.time.LocalDateTime;

public class TicketResponseDTO {

    private Long id;
    private String qrCode;
    private LocalDateTime issueDate;
    private LocalDateTime checkInTime;
    private String ticketStatus;
    private Long bookingId;

    public TicketResponseDTO() {

    }

    public TicketResponseDTO(Long id, String qrCode, LocalDateTime issueDate, LocalDateTime checkInTime,
                             String ticketStatus, Long bookingId) {
        this.id = id;
        this.qrCode = qrCode;
        this.issueDate = issueDate;
        this.checkInTime = checkInTime;
        this.ticketStatus = ticketStatus;
        this.bookingId = bookingId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }

    public LocalDateTime getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDateTime issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public String getTicketStatus() {
        return ticketStatus;
    }

    public void setTicketStatus(String ticketStatus) {
        this.ticketStatus = ticketStatus;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }
}

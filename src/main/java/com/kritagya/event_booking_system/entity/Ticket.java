package com.kritagya.event_booking_system.entity;

import com.kritagya.event_booking_system.enums.TicketStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String qrCode;
    private LocalDateTime issueDate;

    @Enumerated(EnumType.STRING)
    private TicketStatus ticketStatus;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    public Ticket() {

    }

    public Ticket(String qrCode, LocalDateTime issueDate, TicketStatus ticketStatus, Booking booking) {
        this.qrCode = qrCode;
        this.issueDate = issueDate;
        this.ticketStatus = ticketStatus;
        this.booking = booking;
    }

    public Long getId() {
        return id;
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

    public TicketStatus getTicketStatus() {
        return ticketStatus;
    }

    public void setTicketStatus(TicketStatus ticketStatus) {
        this.ticketStatus = ticketStatus;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }
}

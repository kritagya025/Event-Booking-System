package com.kritagya.event_booking_system.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingResponseDTO {

    private Long id;
    private LocalDateTime bookingDate;
    private String bookingStatus;
    private Integer quantity;
    private BigDecimal totalAmount;
    private Long userId;
    private String userName;
    private Long eventId;
    private String eventName;

    public BookingResponseDTO() {

    }

    public BookingResponseDTO(Long id, LocalDateTime bookingDate, String bookingStatus, Integer quantity,
                              BigDecimal totalAmount, Long userId, String userName,
                              Long eventId, String eventName) {
        this.id = id;
        this.bookingDate = bookingDate;
        this.bookingStatus = bookingStatus;
        this.quantity = quantity;
        this.totalAmount = totalAmount;
        this.userId = userId;
        this.userName = userName;
        this.eventId = eventId;
        this.eventName = eventName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
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

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }
}

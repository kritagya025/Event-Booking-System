package com.kritagya.event_booking_system.exception;

public class BookingNotFoundException extends ResourceNotFoundException {

    private static final long serialVersionUID = 1L;

    public BookingNotFoundException(Long id) {
        super("Booking not found with id: " + id);
    }
}

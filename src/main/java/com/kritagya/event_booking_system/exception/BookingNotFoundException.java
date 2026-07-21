package com.kritagya.event_booking_system.exception;

public class BookingNotFoundException extends ResourceNotFoundException {

    public BookingNotFoundException(Long id) {
        super("Booking not found with id: " + id);
    }
}

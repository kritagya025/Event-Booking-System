package com.kritagya.event_booking_system.exception;

public class SeatNotFoundException extends ResourceNotFoundException {

    private static final long serialVersionUID = 1L;

    public SeatNotFoundException(Long id) {
        super("Seat not found with id: " + id);
    }
}

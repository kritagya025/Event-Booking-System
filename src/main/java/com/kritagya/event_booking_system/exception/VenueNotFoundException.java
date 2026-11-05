package com.kritagya.event_booking_system.exception;

public class VenueNotFoundException extends ResourceNotFoundException {

    private static final long serialVersionUID = 1L;

    public VenueNotFoundException(Long id) {
        super("Venue not found with id: " + id);
    }
}

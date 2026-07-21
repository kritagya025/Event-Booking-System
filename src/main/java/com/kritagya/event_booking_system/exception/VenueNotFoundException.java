package com.kritagya.event_booking_system.exception;

public class VenueNotFoundException extends ResourceNotFoundException {

    public VenueNotFoundException(Long id) {
        super("Venue not found with id: " + id);
    }
}

package com.kritagya.event_booking_system.exception;

public class EventNotFoundException extends ResourceNotFoundException {

    public EventNotFoundException(Long id) {
        super("Event not found with id: " + id);
    }
}

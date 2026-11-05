package com.kritagya.event_booking_system.exception;

public class UserNotFoundException extends ResourceNotFoundException {

    private static final long serialVersionUID = 1L;

    public UserNotFoundException(Long id) {
        super("User not found with id: " + id);
    }
}

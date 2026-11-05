package com.kritagya.event_booking_system.exception;

public class DuplicateEmailException extends DuplicateResourceException {

    private static final long serialVersionUID = 1L;

    public DuplicateEmailException(String email) {
        super("User already exists with email: " + email);
    }
}

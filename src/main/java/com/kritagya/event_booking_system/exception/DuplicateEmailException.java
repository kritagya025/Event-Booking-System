package com.kritagya.event_booking_system.exception;

public class DuplicateEmailException extends DuplicateResourceException {

    public DuplicateEmailException(String email) {
        super("User already exists with email: " + email);
    }
}

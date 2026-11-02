package com.kritagya.event_booking_system.exception;

public class PaymentNotFoundException extends ResourceNotFoundException {

    public PaymentNotFoundException(Long id) {
        super("Payment not found with id: " + id);
    }

    public PaymentNotFoundException(String message) {
        super(message);
    }
}


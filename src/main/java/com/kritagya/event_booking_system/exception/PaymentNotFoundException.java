package com.kritagya.event_booking_system.exception;

public class PaymentNotFoundException extends ResourceNotFoundException {

    private static final long serialVersionUID = 1L;

    public PaymentNotFoundException(Long id) {
        super("Payment not found with id: " + id);
    }

    public PaymentNotFoundException(String message) {
        super(message);
    }
}


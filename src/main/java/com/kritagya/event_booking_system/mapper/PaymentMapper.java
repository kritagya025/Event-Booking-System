package com.kritagya.event_booking_system.mapper;

import com.kritagya.event_booking_system.dto.PaymentResponseDTO;
import com.kritagya.event_booking_system.entity.Payment;

public class PaymentMapper {

    public static PaymentResponseDTO toDTO(Payment payment) {
        return new PaymentResponseDTO(
                payment.getId(),
                payment.getAmount(),
                payment.getPaymentMethod().name(),
                payment.getPaymentStatus().name(),
                payment.getTransactionId(),
                payment.getBooking().getId()
        );
    }
}

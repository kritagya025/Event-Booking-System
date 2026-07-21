package com.kritagya.event_booking_system.mapper;

import com.kritagya.event_booking_system.dto.BookingResponseDTO;
import com.kritagya.event_booking_system.entity.Booking;

public class BookingMapper {

    public static BookingResponseDTO toDTO(Booking booking) {
        return new BookingResponseDTO(
                booking.getId(),
                booking.getBookingDate(),
                booking.getBookingStatus().name(),
                booking.getQuantity(),
                booking.getTotalAmount(),
                booking.getUser().getId(),
                booking.getUser().getFirstName() + " " + booking.getUser().getLastName(),
                booking.getEvent().getId(),
                booking.getEvent().getName()
        );
    }
}

package com.kritagya.event_booking_system.mapper;

import com.kritagya.event_booking_system.dto.SeatRequestDTO;
import com.kritagya.event_booking_system.dto.SeatResponseDTO;
import com.kritagya.event_booking_system.entity.Seat;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.enums.SeatStatus;
import com.kritagya.event_booking_system.enums.SeatType;

public class SeatMapper {

    public static Seat toEntity(SeatRequestDTO request, Venue venue) {
        return new Seat(
                request.getSeatNumber(),
                request.getRowNumber(),
                SeatType.valueOf(request.getSeatType()),
                SeatStatus.valueOf(request.getStatus()),
                venue
        );
    }

    public static SeatResponseDTO toDTO(Seat seat) {
        return new SeatResponseDTO(
                seat.getId(),
                seat.getSeatNumber(),
                seat.getRowNumber(),
                seat.getSeatType().name(),
                seat.getStatus().name(),
                seat.getVenue().getId(),
                seat.getVenue().getName()
        );
    }
}

package com.kritagya.event_booking_system.mapper;

import com.kritagya.event_booking_system.dto.EventRequestDTO;
import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.Venue;

public class EventMapper {

    public static Event toEntity(EventRequestDTO request, Venue venue) {
        return new Event(
                request.getName(),
                request.getDescription(),
                request.getEventDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getCategory(),
                request.getStatus(),
                request.getTicketPrice(),
                request.getAvailableSeats(),
                venue
        );
    }

    public static EventResponseDTO toDTO(Event event) {
        return new EventResponseDTO(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getEventDate(),
                event.getStartTime(),
                event.getEndTime(),
                event.getCategory(),
                event.getStatus(),
                event.getTicketPrice(),
                event.getAvailableSeats(),
                event.getVenue().getId(),
                event.getVenue().getName()
        );
    }
}

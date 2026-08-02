package com.kritagya.event_booking_system.mapper;

import com.kritagya.event_booking_system.dto.EventRequestDTO;
import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.enums.EventStatus;

public class EventMapper {

    public static Event toEntity(EventRequestDTO request, Venue venue, User organizer) {
        Event event = new Event(
                request.getName(),
                request.getDescription(),
                request.getEventDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getCategory(),
                request.getStatus() != null ? EventStatus.valueOf(request.getStatus()) : EventStatus.DRAFT,
                request.getTicketPrice(),
                request.getAvailableSeats(),
                venue
        );
        event.setOrganizer(organizer);
        event.setRegistrationDeadline(request.getRegistrationDeadline());
        return event;
    }

    public static EventResponseDTO toDTO(Event event) {
        Long organizerId = null;
        String organizerName = null;
        if (event.getOrganizer() != null) {
            organizerId = event.getOrganizer().getId();
            organizerName = event.getOrganizer().getFirstName() + " " + event.getOrganizer().getLastName();
        }

        return new EventResponseDTO(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getEventDate(),
                event.getStartTime(),
                event.getEndTime(),
                event.getCategory(),
                event.getStatus() != null ? event.getStatus().name() : null,
                event.getTicketPrice(),
                event.getAvailableSeats(),
                event.getRegistrationDeadline(),
                event.getVenue().getId(),
                event.getVenue().getName(),
                organizerId,
                organizerName
        );
    }
}

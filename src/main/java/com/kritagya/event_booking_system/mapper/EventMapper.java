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
                parseStatus(request.getStatus()),
                request.getTicketPrice(),
                request.getAvailableSeats(),
                venue
        );
        event.setOrganizer(organizer);
        event.setRegistrationDeadline(request.getRegistrationDeadline());

        String currency = request.getCurrency();
        if (currency == null || currency.isBlank()) {
            currency = inferCurrencyFromVenue(venue);
        }
        event.setCurrency(currency);

        return event;
    }

    public static EventResponseDTO toDTO(Event event) {
        Long organizerId = null;
        String organizerName = null;
        if (event.getOrganizer() != null) {
            organizerId = event.getOrganizer().getId();
            organizerName = event.getOrganizer().getFirstName() + " " + event.getOrganizer().getLastName();
        }

        Long venueId = event.getVenue() != null ? event.getVenue().getId() : null;
        String venueName = event.getVenue() != null ? event.getVenue().getName() : null;

        String currency = event.getCurrency();
        if (currency == null || currency.isBlank()) {
            currency = inferCurrencyFromVenue(event.getVenue());
        }

        EventResponseDTO dto = new EventResponseDTO(
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
                venueId,
                venueName,
                organizerId,
                organizerName
        );
        dto.setCurrency(currency);
        return dto;
    }

    private static String inferCurrencyFromVenue(Venue venue) {
        if (venue == null || venue.getAddress() == null) {
            return "USD";
        }
        String addr = venue.getAddress().toLowerCase();
        if (addr.contains("india") || addr.contains("delhi") || addr.contains("mumbai") || addr.contains("bangalore")) {
            return "INR";
        }
        if (addr.contains("uk") || addr.contains("london") || addr.contains("england")) {
            return "GBP";
        }
        if (addr.contains("europe") || addr.contains("germany") || addr.contains("france") || addr.contains("berlin") || addr.contains("paris")) {
            return "EUR";
        }
        return "USD";
    }

    private static EventStatus parseStatus(String statusStr) {
        if (statusStr == null || statusStr.isBlank()) {
            return EventStatus.PUBLISHED;
        }
        try {
            return EventStatus.valueOf(statusStr.toUpperCase());
        } catch (Exception e) {
            return EventStatus.PUBLISHED;
        }
    }
}

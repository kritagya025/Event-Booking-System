package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.exception.EventNotFoundException;
import com.kritagya.event_booking_system.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class CalendarService {

    private static final DateTimeFormatter ICS_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");

    private final EventRepository eventRepository;

    public CalendarService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Transactional(readOnly = true)
    public String generateICalendar(Long eventId) {
        Event event = eventRepository.findByIdAndDeletedFalse(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        LocalDateTime startDateTime = LocalDateTime.of(event.getEventDate(),
                event.getStartTime() != null ? event.getStartTime() : java.time.LocalTime.of(9, 0));
        LocalDateTime endDateTime = LocalDateTime.of(event.getEventDate(),
                event.getEndTime() != null ? event.getEndTime() : startDateTime.toLocalTime().plusHours(2));

        String location = event.getVenue() != null ?
                event.getVenue().getName() + ", " + event.getVenue().getAddress() : "TBD";

        StringBuilder ics = new StringBuilder();
        ics.append("BEGIN:VCALENDAR\r\n");
        ics.append("VERSION:2.0\r\n");
        ics.append("PRODID:-//Event Booking System//EN\r\n");
        ics.append("BEGIN:VEVENT\r\n");
        ics.append("UID:event-").append(event.getId()).append("@eventbookingsystem.com\r\n");
        ics.append("DTSTAMP:").append(LocalDateTime.now().format(ICS_DATE_FORMAT)).append("Z\r\n");
        ics.append("DTSTART:").append(startDateTime.format(ICS_DATE_FORMAT)).append("\r\n");
        ics.append("DTEND:").append(endDateTime.format(ICS_DATE_FORMAT)).append("\r\n");
        ics.append("SUMMARY:").append(escapeIcsText(event.getName())).append("\r\n");
        ics.append("DESCRIPTION:").append(escapeIcsText(event.getDescription() != null ? event.getDescription() : "")).append("\r\n");
        ics.append("LOCATION:").append(escapeIcsText(location)).append("\r\n");
        ics.append("END:VEVENT\r\n");
        ics.append("END:VCALENDAR\r\n");

        return ics.toString();
    }

    @Transactional(readOnly = true)
    public String generateGoogleCalendarLink(Long eventId) {
        Event event = eventRepository.findByIdAndDeletedFalse(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        LocalDateTime startDateTime = LocalDateTime.of(event.getEventDate(),
                event.getStartTime() != null ? event.getStartTime() : java.time.LocalTime.of(9, 0));
        LocalDateTime endDateTime = LocalDateTime.of(event.getEventDate(),
                event.getEndTime() != null ? event.getEndTime() : startDateTime.toLocalTime().plusHours(2));

        String dates = startDateTime.format(ICS_DATE_FORMAT) + "/" + endDateTime.format(ICS_DATE_FORMAT);
        String location = event.getVenue() != null ?
                event.getVenue().getName() + ", " + event.getVenue().getAddress() : "TBD";

        return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
                "&text=" + URLEncoder.encode(event.getName(), StandardCharsets.UTF_8) +
                "&dates=" + dates +
                "&details=" + URLEncoder.encode(event.getDescription() != null ? event.getDescription() : "", StandardCharsets.UTF_8) +
                "&location=" + URLEncoder.encode(location, StandardCharsets.UTF_8);
    }

    private String escapeIcsText(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                .replace(";", "\\;")
                .replace(",", "\\,")
                .replace("\n", "\\n");
    }
}

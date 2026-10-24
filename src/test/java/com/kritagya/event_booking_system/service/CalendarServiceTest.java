package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.enums.EventStatus;
import com.kritagya.event_booking_system.exception.EventNotFoundException;
import com.kritagya.event_booking_system.repository.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalendarServiceTest {

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private CalendarService calendarService;

    private Event testEvent;

    @BeforeEach
    void setUp() {
        Venue venue = new Venue("Civic Arena", "123 Main St, Tech City", 5000, "Civic Arena Venue");
        testEvent = new Event("Tech Summit 2026", "A great conference; meet, learn, explore\nInnovate!",
                LocalDate.of(2026, 11, 15), LocalTime.of(10, 0), LocalTime.of(17, 0),
                "CONFERENCE", EventStatus.PUBLISHED, BigDecimal.valueOf(199.99), 500, venue);
        testEvent.setId(42L);
    }

    @Test
    @DisplayName("generateICalendar produces valid RFC 5545 format with escaped text")
    void generateICalendar_Success() {
        when(eventRepository.findByIdAndDeletedFalse(42L)).thenReturn(Optional.of(testEvent));

        String ics = calendarService.generateICalendar(42L);

        assertThat(ics).isNotNull();
        assertThat(ics).contains("BEGIN:VCALENDAR");
        assertThat(ics).contains("VERSION:2.0");
        assertThat(ics).contains("BEGIN:VEVENT");
        assertThat(ics).contains("UID:event-42@eventbookingsystem.com");
        assertThat(ics).contains("DTSTART:20261115T100000");
        assertThat(ics).contains("DTEND:20261115T170000");
        assertThat(ics).contains("SUMMARY:Tech Summit 2026");
        // Check escaping of special characters (; , \n)
        assertThat(ics).contains("A great conference\\; meet\\, learn\\, explore\\nInnovate!");
        assertThat(ics).contains("LOCATION:Civic Arena\\, 123 Main St\\, Tech City");
        assertThat(ics).contains("END:VEVENT");
        assertThat(ics).contains("END:VCALENDAR");
    }

    @Test
    @DisplayName("generateICalendar throws EventNotFoundException when event does not exist")
    void generateICalendar_NotFound() {
        when(eventRepository.findByIdAndDeletedFalse(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> calendarService.generateICalendar(999L))
                .isInstanceOf(EventNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    @DisplayName("generateGoogleCalendarLink produces correctly URL-encoded URL")
    void generateGoogleCalendarLink_Success() {
        when(eventRepository.findByIdAndDeletedFalse(42L)).thenReturn(Optional.of(testEvent));

        String url = calendarService.generateGoogleCalendarLink(42L);

        assertThat(url).isNotNull();
        assertThat(url).startsWith("https://calendar.google.com/calendar/render?action=TEMPLATE");
        assertThat(url).contains("text=Tech+Summit+2026");
        assertThat(url).contains("dates=20261115T100000/20261115T170000");
        assertThat(url).contains("location=");
    }
}

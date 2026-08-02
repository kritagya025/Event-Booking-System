package com.kritagya.event_booking_system.scheduler;

import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.enums.BookingStatus;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class EventReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(EventReminderScheduler.class);

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;

    public EventReminderScheduler(EventRepository eventRepository,
                                  BookingRepository bookingRepository,
                                  EmailService emailService) {
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
    }

    @Scheduled(cron = "0 0 8 * * ?") // Runs every day at 8:00 AM
    @Transactional(readOnly = true)
    public void sendUpcomingEventReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Event> upcomingEvents = eventRepository.findByEventDateAndDeletedFalse(tomorrow);

        log.info("Found {} upcoming events scheduled for tomorrow ({})", upcomingEvents.size(), tomorrow);

        for (Event event : upcomingEvents) {
            List<Booking> bookings = bookingRepository.findByEventIdAndBookingStatus(event.getId(), BookingStatus.CONFIRMED);
            for (Booking booking : bookings) {
                emailService.sendEventReminderEmail(booking.getUser(), booking);
            }
        }
    }
}

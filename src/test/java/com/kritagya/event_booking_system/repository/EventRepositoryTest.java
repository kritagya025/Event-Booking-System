package com.kritagya.event_booking_system.repository;

import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.enums.EventStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EventRepositoryTest {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Test
    @DisplayName("Should find event by ID when not soft-deleted")
    void findByIdAndDeletedFalse_ActiveEvent() {
        Venue venue = venueRepository.save(new Venue("Arena", "Main St", 1000, "Big arena"));

        Event event = new Event("Tech Summit", "AI conference", LocalDate.now().plusDays(5),
                LocalTime.of(9, 0), LocalTime.of(17, 0), "TECH",
                EventStatus.PUBLISHED, BigDecimal.valueOf(150), 200, venue);
        Event savedEvent = eventRepository.save(event);

        Optional<Event> found = eventRepository.findByIdAndDeletedFalse(savedEvent.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Tech Summit");
    }

    @Test
    @DisplayName("Should NOT find soft-deleted event")
    void findByIdAndDeletedFalse_DeletedEvent() {
        Venue venue = venueRepository.save(new Venue("Arena", "Main St", 1000, "Big arena"));

        Event event = new Event("Tech Summit", "AI conference", LocalDate.now().plusDays(5),
                LocalTime.of(9, 0), LocalTime.of(17, 0), "TECH",
                EventStatus.PUBLISHED, BigDecimal.valueOf(150), 200, venue);
        event.setDeleted(true);
        Event savedEvent = eventRepository.save(event);

        Optional<Event> found = eventRepository.findByIdAndDeletedFalse(savedEvent.getId());

        assertThat(found).isEmpty();
    }
}

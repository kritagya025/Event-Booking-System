package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.EventRequestDTO;
import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.enums.EventStatus;
import com.kritagya.event_booking_system.enums.Role;
import com.kritagya.event_booking_system.exception.EventNotFoundException;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private com.kritagya.event_booking_system.logging.AuditLogger auditLogger;

    @Mock
    private com.kritagya.event_booking_system.repository.BookingRepository bookingRepository;

    @Mock
    private com.kritagya.event_booking_system.repository.ReviewRepository reviewRepository;

    @InjectMocks
    private EventService eventService;

    private Venue venue;
    private User organizer;
    private Event event;
    private EventRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        venue = new Venue("Test Venue", "123 Test St", 500, "A test venue");

        organizer = new User("John", "Doe", "john@example.com", "encoded", "1234567890", Role.ORGANIZER);

        event = new Event("Test Event", "Description", LocalDate.now().plusDays(30),
                LocalTime.of(10, 0), LocalTime.of(18, 0), "MUSIC",
                EventStatus.DRAFT, BigDecimal.valueOf(50), 100, venue);
        event.setOrganizer(organizer);

        requestDTO = new EventRequestDTO();
        requestDTO.setName("Test Event");
        requestDTO.setDescription("Description");
        requestDTO.setEventDate(LocalDate.now().plusDays(30));
        requestDTO.setStartTime(LocalTime.of(10, 0));
        requestDTO.setEndTime(LocalTime.of(18, 0));
        requestDTO.setCategory("MUSIC");
        requestDTO.setStatus("DRAFT");
        requestDTO.setTicketPrice(BigDecimal.valueOf(50));
        requestDTO.setAvailableSeats(100);
        requestDTO.setVenueId(1L);
    }

    @Test
    @DisplayName("Should create event with organizer mapping")
    void createEvent_Success() {
        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));
        when(eventRepository.save(any(Event.class))).thenReturn(event);

        EventResponseDTO result = eventService.createEvent(requestDTO, organizer);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Test Event");
        assertThat(result.getStatus()).isEqualTo("DRAFT");
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    @DisplayName("Should return paginated events")
    void getAllEvents_Paginated() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Event> page = new PageImpl<>(List.of(event), pageable, 1);
        when(eventRepository.findByDeletedFalse(pageable)).thenReturn(page);

        Page<EventResponseDTO> result = eventService.getAllEvents(pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Test Event");
    }

    @Test
    @DisplayName("Should get event by ID (non-deleted)")
    void getEvent_Success() {
        when(eventRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(event));

        EventResponseDTO result = eventService.getEvent(1L);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Test Event");
    }

    @Test
    @DisplayName("Should throw EventNotFoundException for missing event")
    void getEvent_NotFound() {
        when(eventRepository.findByIdAndDeletedFalse(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.getEvent(99L))
                .isInstanceOf(EventNotFoundException.class);
    }

    @Test
    @DisplayName("Should soft delete event")
    void deleteEvent_SoftDelete() {
        when(eventRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenReturn(event);

        eventService.deleteEvent(1L);

        assertThat(event.isDeleted()).isTrue();
        verify(eventRepository).save(event);
        verify(eventRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Should publish event")
    void publishEvent_Success() {
        when(eventRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenReturn(event);

        EventResponseDTO result = eventService.publishEvent(1L);

        assertThat(result).isNotNull();
        assertThat(event.getStatus()).isEqualTo(EventStatus.PUBLISHED);
    }

    @Test
    @DisplayName("Should unpublish event back to DRAFT")
    void unpublishEvent_Success() {
        event.setStatus(EventStatus.PUBLISHED);
        when(eventRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenReturn(event);

        EventResponseDTO result = eventService.unpublishEvent(1L);

        assertThat(result).isNotNull();
        assertThat(event.getStatus()).isEqualTo(EventStatus.DRAFT);
    }
}

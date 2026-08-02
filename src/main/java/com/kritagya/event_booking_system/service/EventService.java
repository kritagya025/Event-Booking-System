package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.EventAnalyticsDTO;
import com.kritagya.event_booking_system.dto.EventRequestDTO;
import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.enums.BookingStatus;
import com.kritagya.event_booking_system.enums.EventStatus;
import com.kritagya.event_booking_system.exception.EventNotFoundException;
import com.kritagya.event_booking_system.exception.VenueNotFoundException;
import com.kritagya.event_booking_system.logging.AuditLogger;
import com.kritagya.event_booking_system.mapper.EventMapper;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.ReviewRepository;
import com.kritagya.event_booking_system.repository.VenueRepository;
import com.kritagya.event_booking_system.specification.EventSpecification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EventService {

    private static final Logger log = LoggerFactory.getLogger(EventService.class);

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final AuditLogger auditLogger;

    public EventService(EventRepository eventRepository, VenueRepository venueRepository,
                        BookingRepository bookingRepository, ReviewRepository reviewRepository,
                        AuditLogger auditLogger) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.auditLogger = auditLogger;
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventResponseDTO createEvent(EventRequestDTO request, User organizer) {
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new VenueNotFoundException(request.getVenueId()));

        Event event = EventMapper.toEntity(request, venue, organizer);
        Event savedEvent = eventRepository.save(event);
        String organizerEmail = organizer != null ? organizer.getEmail() : "SYSTEM";
        auditLogger.logEventCreated(savedEvent.getId(), savedEvent.getName(), organizerEmail);
        log.info("Event created with ID: {} by organizer: {}", savedEvent.getId(), organizerEmail);

        return EventMapper.toDTO(savedEvent);
    }

    public Page<EventResponseDTO> getAllEvents(Pageable pageable) {
        return eventRepository.findByDeletedFalse(pageable)
                .map(EventMapper::toDTO);
    }

    public Page<EventResponseDTO> searchEvents(String category, LocalDate dateFrom, LocalDate dateTo,
                                                Long venueId, String city, String keyword,
                                                BigDecimal minPrice, BigDecimal maxPrice,
                                                Pageable pageable) {
        Specification<Event> spec = EventSpecification.withFilters(
                category, dateFrom, dateTo, venueId, city, keyword, minPrice, maxPrice);
        return eventRepository.findAll(spec, pageable).map(EventMapper::toDTO);
    }

    @Cacheable(value = "events", key = "#id")
    public EventResponseDTO getEvent(Long id) {
        log.debug("Fetching event from database for ID: {}", id);
        Event event = eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        return EventMapper.toDTO(event);
    }

    public List<EventResponseDTO> getEventsByVenue(Long venueId) {
        if (!venueRepository.existsById(venueId)) {
            throw new VenueNotFoundException(venueId);
        }
        return eventRepository.findByVenueId(venueId)
                .stream()
                .filter(e -> !e.isDeleted())
                .map(EventMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventResponseDTO updateEvent(Long id, EventRequestDTO request) {
        Event event = eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new VenueNotFoundException(request.getVenueId()));

        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setCategory(request.getCategory());
        if (request.getStatus() != null) {
            event.setStatus(EventStatus.valueOf(request.getStatus()));
        }
        event.setTicketPrice(request.getTicketPrice());
        event.setAvailableSeats(request.getAvailableSeats());
        event.setRegistrationDeadline(request.getRegistrationDeadline());
        event.setVenue(venue);

        Event updatedEvent = eventRepository.save(event);
        auditLogger.logEventUpdated(updatedEvent.getId(), updatedEvent.getName(), "ADMIN/ORGANIZER");
        log.info("Event updated with ID: {}", updatedEvent.getId());

        return EventMapper.toDTO(updatedEvent);
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public void deleteEvent(Long id) {
        Event event = eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        event.setDeleted(true);
        eventRepository.save(event);
        log.info("Event soft deleted with ID: {}", id);
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventResponseDTO publishEvent(Long id) {
        Event event = eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        event.setStatus(EventStatus.PUBLISHED);
        Event savedEvent = eventRepository.save(event);
        log.info("Event published with ID: {}", id);
        return EventMapper.toDTO(savedEvent);
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventResponseDTO unpublishEvent(Long id) {
        Event event = eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        event.setStatus(EventStatus.DRAFT);
        Event savedEvent = eventRepository.save(event);
        log.info("Event unpublished with ID: {}", id);
        return EventMapper.toDTO(savedEvent);
    }

    @Transactional
    public void incrementViewCount(Long eventId) {
        Event event = eventRepository.findByIdAndDeletedFalse(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));
        event.setViewCount(event.getViewCount() != null ? event.getViewCount() + 1 : 1L);
        eventRepository.save(event);
    }

    public EventAnalyticsDTO getEventAnalytics(Long eventId) {
        Event event = eventRepository.findByIdAndDeletedFalse(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        Long bookingCount = bookingRepository.countByEventIdAndBookingStatus(eventId, BookingStatus.CONFIRMED);
        BigDecimal revenue = bookingRepository.sumRevenueByEventIdAndStatus(eventId, BookingStatus.CONFIRMED);
        Double averageRating = reviewRepository.getAverageRatingByEventId(eventId);

        int totalCapacity = event.getVenue() != null ? event.getVenue().getCapacity() : 0;
        double occupancy = 0.0;
        if (totalCapacity > 0 && event.getAvailableSeats() != null) {
            int bookedSeats = totalCapacity - event.getAvailableSeats();
            occupancy = ((double) bookedSeats / totalCapacity) * 100.0;
            occupancy = Math.round(occupancy * 10.0) / 10.0;
        }

        return new EventAnalyticsDTO(
                event.getId(),
                event.getName(),
                event.getViewCount() != null ? event.getViewCount() : 0L,
                bookingCount,
                revenue,
                occupancy,
                Math.round((averageRating != null ? averageRating : 0.0) * 10.0) / 10.0
        );
    }

    public List<EventResponseDTO> getPopularEvents(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return eventRepository.findByDeletedFalse(pageable)
                .stream()
                .sorted(Comparator.comparing(Event::getViewCount, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(EventMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<EventResponseDTO> getTrendingEvents(int limit) {
        List<Event> upcomingEvents = eventRepository.findByDeletedFalse(PageRequest.of(0, 100, Sort.by("eventDate").ascending()))
                .stream()
                .filter(e -> e.getEventDate() != null && !e.getEventDate().isBefore(LocalDate.now()))
                .collect(Collectors.toList());

        return upcomingEvents.stream()
                .sorted((e1, e2) -> {
                    Long count1 = bookingRepository.countByEventIdAndBookingStatus(e1.getId(), BookingStatus.CONFIRMED);
                    Long count2 = bookingRepository.countByEventIdAndBookingStatus(e2.getId(), BookingStatus.CONFIRMED);
                    return count2.compareTo(count1);
                })
                .limit(limit)
                .map(EventMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<EventResponseDTO> getRecommendedEvents(User user, int limit) {
        List<Booking> userBookings = bookingRepository.findByUserId(user.getId());
        Set<String> userCategories = userBookings.stream()
                .map(b -> b.getEvent().getCategory())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (userCategories.isEmpty()) {
            return getPopularEvents(limit);
        }

        return eventRepository.findByDeletedFalse(PageRequest.of(0, 100, Sort.by("eventDate").ascending()))
                .stream()
                .filter(e -> e.getEventDate() != null && !e.getEventDate().isBefore(LocalDate.now()))
                .filter(e -> e.getCategory() != null && userCategories.contains(e.getCategory()))
                .limit(limit)
                .map(EventMapper::toDTO)
                .collect(Collectors.toList());
    }
}

package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.EventRequestDTO;
import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.enums.EventStatus;
import com.kritagya.event_booking_system.exception.EventNotFoundException;
import com.kritagya.event_booking_system.exception.VenueNotFoundException;
import com.kritagya.event_booking_system.mapper.EventMapper;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.VenueRepository;
import com.kritagya.event_booking_system.specification.EventSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;

    public EventService(EventRepository eventRepository, VenueRepository venueRepository) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
    }

    @Transactional
    public EventResponseDTO createEvent(EventRequestDTO request, User organizer) {
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new VenueNotFoundException(request.getVenueId()));

        Event event = EventMapper.toEntity(request, venue, organizer);
        Event savedEvent = eventRepository.save(event);
        return EventMapper.toDTO(savedEvent);
    }

    public Page<EventResponseDTO> getAllEvents(Pageable pageable) {
        return eventRepository.findByDeletedFalse(pageable)
                .map(EventMapper::toDTO);
    }

    public Page<EventResponseDTO> searchEvents(String category, LocalDate dateFrom, LocalDate dateTo,
                                                Long venueId, String keyword,
                                                BigDecimal minPrice, BigDecimal maxPrice,
                                                Pageable pageable) {
        Specification<Event> spec = EventSpecification.withFilters(
                category, dateFrom, dateTo, venueId, keyword, minPrice, maxPrice);
        return eventRepository.findAll(spec, pageable).map(EventMapper::toDTO);
    }

    public EventResponseDTO getEvent(Long id) {
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
        return EventMapper.toDTO(updatedEvent);
    }

    @Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        event.setDeleted(true);
        eventRepository.save(event);
    }

    @Transactional
    public EventResponseDTO publishEvent(Long id) {
        Event event = eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        event.setStatus(EventStatus.PUBLISHED);
        Event savedEvent = eventRepository.save(event);
        return EventMapper.toDTO(savedEvent);
    }

    @Transactional
    public EventResponseDTO unpublishEvent(Long id) {
        Event event = eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        event.setStatus(EventStatus.DRAFT);
        Event savedEvent = eventRepository.save(event);
        return EventMapper.toDTO(savedEvent);
    }
}

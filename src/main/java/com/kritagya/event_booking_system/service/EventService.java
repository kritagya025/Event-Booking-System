package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.EventRequestDTO;
import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.exception.EventNotFoundException;
import com.kritagya.event_booking_system.exception.VenueNotFoundException;
import com.kritagya.event_booking_system.mapper.EventMapper;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.VenueRepository;
import org.springframework.stereotype.Service;

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

    public EventResponseDTO createEvent(EventRequestDTO request) {
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new VenueNotFoundException(request.getVenueId()));

        Event event = EventMapper.toEntity(request, venue);
        Event savedEvent = eventRepository.save(event);
        return EventMapper.toDTO(savedEvent);
    }

    public List<EventResponseDTO> getAllEvents() {
        return eventRepository.findAll()
                .stream()
                .map(EventMapper::toDTO)
                .collect(Collectors.toList());
    }

    public EventResponseDTO getEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        return EventMapper.toDTO(event);
    }

    public List<EventResponseDTO> getEventsByVenue(Long venueId) {
        if (!venueRepository.existsById(venueId)) {
            throw new VenueNotFoundException(venueId);
        }
        return eventRepository.findByVenueId(venueId)
                .stream()
                .map(EventMapper::toDTO)
                .collect(Collectors.toList());
    }

    public EventResponseDTO updateEvent(Long id, EventRequestDTO request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new VenueNotFoundException(request.getVenueId()));

        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setCategory(request.getCategory());
        event.setStatus(request.getStatus());
        event.setTicketPrice(request.getTicketPrice());
        event.setAvailableSeats(request.getAvailableSeats());
        event.setVenue(venue);

        Event updatedEvent = eventRepository.save(event);
        return EventMapper.toDTO(updatedEvent);
    }

    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EventNotFoundException(id);
        }
        eventRepository.deleteById(id);
    }
}

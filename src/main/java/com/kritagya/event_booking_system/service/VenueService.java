package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.VenueRequestDTO;
import com.kritagya.event_booking_system.dto.VenueResponseDTO;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.exception.VenueNotFoundException;
import com.kritagya.event_booking_system.mapper.VenueMapper;
import com.kritagya.event_booking_system.repository.VenueRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VenueService {

    private final VenueRepository venueRepository;

    public VenueService(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    public VenueResponseDTO createVenue(VenueRequestDTO request) {
        Venue venue = VenueMapper.toEntity(request);
        Venue savedVenue = venueRepository.save(venue);
        return VenueMapper.toDTO(savedVenue);
    }

    public List<VenueResponseDTO> getAllVenues() {
        return venueRepository.findAll()
                .stream()
                .map(VenueMapper::toDTO)
                .collect(Collectors.toList());
    }

    public VenueResponseDTO getVenue(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new VenueNotFoundException(id));
        return VenueMapper.toDTO(venue);
    }

    public VenueResponseDTO updateVenue(Long id, VenueRequestDTO request) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new VenueNotFoundException(id));

        venue.setName(request.getName());
        venue.setAddress(request.getAddress());
        venue.setCapacity(request.getCapacity());
        venue.setDescription(request.getDescription());

        Venue updatedVenue = venueRepository.save(venue);
        return VenueMapper.toDTO(updatedVenue);
    }

    public void deleteVenue(Long id) {
        if (!venueRepository.existsById(id)) {
            throw new VenueNotFoundException(id);
        }
        venueRepository.deleteById(id);
    }
}

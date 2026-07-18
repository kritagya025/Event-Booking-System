package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.repository.VenueRepository;
import org.springframework.stereotype.Service;
import com.kritagya.event_booking_system.dto.VenueResponseDTO;

import java.util.List;

@Service
public class VenueService {

    private final VenueRepository venueRepository;

    public VenueService(VenueRepository venueRepository){
        this.venueRepository=venueRepository;
    }

    public VenueResponseDTO createVenue(Venue venue){
        validateVenue(venue);
        return mapToDTO(venueRepository.save(venue));
    }

    public List<Venue> getAllVenues(){
        return venueRepository.findAll();
    }

    public VenueResponseDTO getVenue(Long id){
        Venue venue=venueRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Venue not forund"));
        return mapToDTO(venue);
    }

    private void validateVenue(Venue venue){
        if(venue.getCapacity()<=0){
            throw new IllegalArgumentException("Venue capacity must be greater than 0");
        }
    }

    private VenueResponseDTO mapToDTO(Venue venue){
        return new VenueResponseDTO(
                venue.getId(),
                venue.getName(),
                venue.getAddress(),
                venue.getCapacity(),
                venue.getDescription()
        );
    }
}

package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.repository.VenueRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VenueService {

    private final VenueRepository venueRepository;

    public VenueService(VenueRepository venueRepository){
        this.venueRepository=venueRepository;
    }

    public Venue createVenue(Venue venue){
        validateVenue(venue);

        return venueRepository.save(venue);
    }

    public List<Venue> getAllVenues(){
        return venueRepository.findAll();
    }

    public Venue getVenue(Long id){
        return venueRepository.findById(id)
        .orElseThrow(()->new RuntimeException("Venue not found"));
    }

    private void validateVenue(Venue venue){
        if(venue.getCapacity()<=0){
            throw new IllegalArgumentException("Venue capacity must be greater than 0");
        }
    }
}

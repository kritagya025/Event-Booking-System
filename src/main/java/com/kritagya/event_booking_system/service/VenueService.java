package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.VenueRequestDTO;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.mapper.VenueMapper;
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

    public VenueResponseDTO createVenue(VenueRequestDTO request){
        Venue venue= VenueMapper.toEntity(request);
        validateVenue(venue);
        Venue savedVenue=venueRepository.save(venue);
        return VenueMapper.toDTO(savedVenue);
    }

    public List<Venue> getAllVenues(){
        return venueRepository.findAll();
    }

    public VenueResponseDTO getVenue(Long id){
        Venue venue=venueRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Venue not found"));
        return VenueMapper.toDTO(venue);
    }

    private void validateVenue(Venue venue){
        if(venue.getCapacity()==null || venue.getCapacity()<=0){
            throw new IllegalArgumentException("Venue capacity must be greater than 0");
        }
    }

}

package com.kritagya.event_booking_system.mapper;

import com.kritagya.event_booking_system.dto.VenueRequestDTO;
import com.kritagya.event_booking_system.dto.VenueResponseDTO;
import com.kritagya.event_booking_system.entity.Venue;

public class VenueMapper {

    public static Venue toEntity(VenueRequestDTO request){
        return new Venue(
                request.getName(),
                request.getAddress(),
                request.getCapacity(),
                request.getDescription()
        );
    }

    public static VenueResponseDTO toDTO(Venue venue){
        return new VenueResponseDTO(
                venue.getId(),
                venue.getName(),
                venue.getAddress(),
                venue.getCapacity(),
                venue.getDescription()
        );
    }
}

package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.service.VenueService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/venues")
public class VenueController {

    private final VenueService venueService;

    public VenueController(VenueService venueService){
        this.venueService=venueService;
    }

    @PostMapping
    public Venue createVenue(@RequestBody Venue venue){
        return venueService.createVenue(venue);
    }

    @GetMapping
    public List<Venue> getAllVenues(){
        return venueService.getAllVenues();
    }

    @GetMapping("/{id}")
    public Venue getVenue(@PathVariable Long id){
        return venueService.getVenue(id);
    }
}

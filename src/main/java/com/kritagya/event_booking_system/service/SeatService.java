package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.SeatRequestDTO;
import com.kritagya.event_booking_system.dto.SeatResponseDTO;
import com.kritagya.event_booking_system.entity.Seat;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.enums.SeatStatus;
import com.kritagya.event_booking_system.exception.SeatNotFoundException;
import com.kritagya.event_booking_system.exception.VenueNotFoundException;
import com.kritagya.event_booking_system.mapper.SeatMapper;
import com.kritagya.event_booking_system.repository.SeatRepository;
import com.kritagya.event_booking_system.repository.VenueRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SeatService {

    private final SeatRepository seatRepository;
    private final VenueRepository venueRepository;

    public SeatService(SeatRepository seatRepository, VenueRepository venueRepository) {
        this.seatRepository = seatRepository;
        this.venueRepository = venueRepository;
    }

    public SeatResponseDTO createSeat(SeatRequestDTO request) {
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new VenueNotFoundException(request.getVenueId()));

        Seat seat = SeatMapper.toEntity(request, venue);
        Seat savedSeat = seatRepository.save(seat);
        return SeatMapper.toDTO(savedSeat);
    }

    public List<SeatResponseDTO> getAllSeats() {
        return seatRepository.findAll()
                .stream()
                .map(SeatMapper::toDTO)
                .collect(Collectors.toList());
    }

    public SeatResponseDTO getSeat(Long id) {
        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new SeatNotFoundException(id));
        return SeatMapper.toDTO(seat);
    }

    public List<SeatResponseDTO> getSeatsByVenue(Long venueId) {
        if (!venueRepository.existsById(venueId)) {
            throw new VenueNotFoundException(venueId);
        }
        return seatRepository.findByVenueId(venueId)
                .stream()
                .map(SeatMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<SeatResponseDTO> getAvailableSeatsByVenue(Long venueId) {
        if (!venueRepository.existsById(venueId)) {
            throw new VenueNotFoundException(venueId);
        }
        return seatRepository.findByVenueIdAndStatus(venueId, SeatStatus.AVAILABLE)
                .stream()
                .map(SeatMapper::toDTO)
                .collect(Collectors.toList());
    }

    public SeatResponseDTO updateSeat(Long id, SeatRequestDTO request) {
        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new SeatNotFoundException(id));

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new VenueNotFoundException(request.getVenueId()));

        seat.setSeatNumber(request.getSeatNumber());
        seat.setRowNumber(request.getRowNumber());
        seat.setSeatType(com.kritagya.event_booking_system.enums.SeatType.valueOf(request.getSeatType()));
        seat.setStatus(SeatStatus.valueOf(request.getStatus()));
        seat.setVenue(venue);

        Seat updatedSeat = seatRepository.save(seat);
        return SeatMapper.toDTO(updatedSeat);
    }

    public void deleteSeat(Long id) {
        if (!seatRepository.existsById(id)) {
            throw new SeatNotFoundException(id);
        }
        seatRepository.deleteById(id);
    }
}

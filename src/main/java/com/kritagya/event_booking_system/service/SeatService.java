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
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new VenueNotFoundException(venueId));

        List<Seat> seats = seatRepository.findByVenueId(venueId);
        if (seats.isEmpty()) {
            int capacity = venue.getCapacity() != null && venue.getCapacity() > 0 ? venue.getCapacity() : 40;
            seats = new java.util.ArrayList<>();
            int seatsPerRow = 8;
            int totalRows = (int) Math.ceil((double) capacity / seatsPerRow);

            for (int r = 0; r < totalRows; r++) {
                String rowLetter = String.valueOf((char) ('A' + r % 26));
                com.kritagya.event_booking_system.enums.SeatType seatType = (r == 0) ? com.kritagya.event_booking_system.enums.SeatType.VIP : com.kritagya.event_booking_system.enums.SeatType.REGULAR;

                for (int s = 1; s <= seatsPerRow; s++) {
                    if (seats.size() >= capacity) break;
                    String seatNum = rowLetter + s;
                    Seat seat = new Seat(seatNum, rowLetter, seatType, SeatStatus.AVAILABLE, venue);
                    seats.add(seat);
                }
            }
            seats = seatRepository.saveAll(seats);
        }

        return seats.stream()
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

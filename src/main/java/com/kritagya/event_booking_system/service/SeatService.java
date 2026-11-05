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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SeatService {

    private static final Logger log = LoggerFactory.getLogger(SeatService.class);

    private final SeatRepository seatRepository;
    private final VenueRepository venueRepository;

    public SeatService(SeatRepository seatRepository, VenueRepository venueRepository) {
        this.seatRepository = seatRepository;
        this.venueRepository = venueRepository;
    }

    @Transactional
    public SeatResponseDTO createSeat(SeatRequestDTO request) {
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new VenueNotFoundException(request.getVenueId()));

        Seat seat = SeatMapper.toEntity(request, venue);
        Seat savedSeat = seatRepository.save(seat);
        log.info("Seat created: id={}, seatNumber={}, venue={}", savedSeat.getId(), savedSeat.getSeatNumber(), venue.getName());
        return SeatMapper.toDTO(savedSeat);
    }

    @Transactional(readOnly = true)
    public List<SeatResponseDTO> getAllSeats() {
        return seatRepository.findAll()
                .stream()
                .map(SeatMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SeatResponseDTO getSeat(Long id) {
        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new SeatNotFoundException(id));
        return SeatMapper.toDTO(seat);
    }

    @Transactional
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
            log.info("Auto-generated {} default seats for venue {}", seats.size(), venueId);
        }

        return seats.stream()
                .map(SeatMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SeatResponseDTO> getAvailableSeatsByVenue(Long venueId) {
        if (!venueRepository.existsById(venueId)) {
            throw new VenueNotFoundException(venueId);
        }
        return seatRepository.findByVenueIdAndStatus(venueId, SeatStatus.AVAILABLE)
                .stream()
                .map(SeatMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
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
        log.info("Seat updated: id={}, status={}", id, updatedSeat.getStatus());
        return SeatMapper.toDTO(updatedSeat);
    }

    @Transactional
    public void deleteSeat(Long id) {
        if (!seatRepository.existsById(id)) {
            throw new SeatNotFoundException(id);
        }
        seatRepository.deleteById(id);
        log.info("Seat deleted: id={}", id);
    }

    @Transactional
    public List<SeatResponseDTO> lockSeats(List<Long> seatIds, int timeoutMinutes) {
        if (seatIds == null || seatIds.isEmpty()) {
            throw new IllegalArgumentException("Seat IDs list cannot be empty");
        }
        int timeout = timeoutMinutes > 0 ? timeoutMinutes : 10;
        LocalDateTime lockedUntil = LocalDateTime.now().plusMinutes(timeout);

        List<Seat> seats = seatRepository.findAllById(seatIds);
        if (seats.size() != seatIds.size()) {
            throw new IllegalArgumentException("One or more specified seats were not found");
        }

        for (Seat seat : seats) {
            if (seat.getStatus() == SeatStatus.BOOKED) {
                throw new IllegalStateException("Seat " + seat.getSeatNumber() + " is already booked");
            }
            if (seat.getStatus() == SeatStatus.LOCKED && seat.getLockedUntil() != null && seat.getLockedUntil().isAfter(LocalDateTime.now())) {
                throw new IllegalStateException("Seat " + seat.getSeatNumber() + " is already locked by another user");
            }
            seat.setStatus(SeatStatus.LOCKED);
            seat.setLockedUntil(lockedUntil);
        }

        List<Seat> savedSeats = seatRepository.saveAll(seats);
        log.info("Locked {} seats until {}", savedSeats.size(), lockedUntil);
        return savedSeats.stream().map(SeatMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public List<SeatResponseDTO> unlockSeats(List<Long> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) {
            throw new IllegalArgumentException("Seat IDs list cannot be empty");
        }

        List<Seat> seats = seatRepository.findAllById(seatIds);
        for (Seat seat : seats) {
            if (seat.getStatus() == SeatStatus.LOCKED) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setLockedUntil(null);
            }
        }

        List<Seat> savedSeats = seatRepository.saveAll(seats);
        log.info("Unlocked {} seats", savedSeats.size());
        return savedSeats.stream().map(SeatMapper::toDTO).collect(Collectors.toList());
    }
}

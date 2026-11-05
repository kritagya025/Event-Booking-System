package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.SeatRequestDTO;
import com.kritagya.event_booking_system.dto.SeatResponseDTO;
import com.kritagya.event_booking_system.entity.Seat;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.enums.SeatStatus;
import com.kritagya.event_booking_system.enums.SeatType;
import com.kritagya.event_booking_system.exception.SeatNotFoundException;
import com.kritagya.event_booking_system.repository.SeatRepository;
import com.kritagya.event_booking_system.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SeatServiceTest {

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private VenueRepository venueRepository;

    @InjectMocks
    private SeatService seatService;

    private Venue venue;
    private Seat seat1;
    private Seat seat2;

    @BeforeEach
    void setUp() {
        venue = new Venue("Madison Square", "7th Ave, New York", 20, "Iconic arena");
        ReflectionTestUtils.setField(venue, "id", 10L);

        seat1 = new Seat("A1", "A", SeatType.VIP, SeatStatus.AVAILABLE, venue);
        ReflectionTestUtils.setField(seat1, "id", 101L);

        seat2 = new Seat("A2", "A", SeatType.REGULAR, SeatStatus.AVAILABLE, venue);
        ReflectionTestUtils.setField(seat2, "id", 102L);
    }

    @Test
    @DisplayName("createSeat successfully creates and returns seat")
    void testCreateSeat_Success() {
        SeatRequestDTO request = new SeatRequestDTO();
        request.setVenueId(10L);
        request.setSeatNumber("B1");
        request.setRowNumber("B");
        request.setSeatType("REGULAR");
        request.setStatus("AVAILABLE");

        when(venueRepository.findById(10L)).thenReturn(Optional.of(venue));
        when(seatRepository.save(any(Seat.class))).thenAnswer(invocation -> {
            Seat s = invocation.getArgument(0);
            ReflectionTestUtils.setField(s, "id", 103L);
            return s;
        });

        SeatResponseDTO response = seatService.createSeat(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(103L);
        assertThat(response.getSeatNumber()).isEqualTo("B1");
        verify(seatRepository).save(any(Seat.class));
    }

    @Test
    @DisplayName("getSeatsByVenue auto-generates grid when venue has no seats")
    void testGetSeatsByVenue_AutoGenerate() {
        when(venueRepository.findById(10L)).thenReturn(Optional.of(venue));
        when(seatRepository.findByVenueId(10L)).thenReturn(new ArrayList<>());
        when(seatRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<SeatResponseDTO> result = seatService.getSeatsByVenue(10L);

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(20); // venue capacity is 20
        verify(seatRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("lockSeats locks available seats until timeout")
    void testLockSeats_Success() {
        when(seatRepository.findAllById(List.of(101L, 102L))).thenReturn(List.of(seat1, seat2));
        when(seatRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<SeatResponseDTO> locked = seatService.lockSeats(List.of(101L, 102L), 15);

        assertThat(locked).hasSize(2);
        assertThat(seat1.getStatus()).isEqualTo(SeatStatus.LOCKED);
        assertThat(seat1.getLockedUntil()).isAfter(LocalDateTime.now().plusMinutes(14));
        assertThat(seat2.getStatus()).isEqualTo(SeatStatus.LOCKED);
        verify(seatRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("lockSeats throws IllegalStateException when seat is already booked")
    void testLockSeats_AlreadyBooked() {
        seat1.setStatus(SeatStatus.BOOKED);
        when(seatRepository.findAllById(List.of(101L))).thenReturn(List.of(seat1));

        assertThatThrownBy(() -> seatService.lockSeats(List.of(101L), 10))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already booked");
    }

    @Test
    @DisplayName("lockSeats throws IllegalStateException when seat is already locked by another user")
    void testLockSeats_AlreadyLocked() {
        seat1.setStatus(SeatStatus.LOCKED);
        seat1.setLockedUntil(LocalDateTime.now().plusMinutes(5));
        when(seatRepository.findAllById(List.of(101L))).thenReturn(List.of(seat1));

        assertThatThrownBy(() -> seatService.lockSeats(List.of(101L), 10))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already locked");
    }

    @Test
    @DisplayName("unlockSeats releases locked seats back to available")
    void testUnlockSeats_Success() {
        seat1.setStatus(SeatStatus.LOCKED);
        seat1.setLockedUntil(LocalDateTime.now().plusMinutes(5));
        when(seatRepository.findAllById(List.of(101L))).thenReturn(List.of(seat1));
        when(seatRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<SeatResponseDTO> result = seatService.unlockSeats(List.of(101L));

        assertThat(result).hasSize(1);
        assertThat(seat1.getStatus()).isEqualTo(SeatStatus.AVAILABLE);
        assertThat(seat1.getLockedUntil()).isNull();
        verify(seatRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("deleteSeat throws SeatNotFoundException when seat does not exist")
    void testDeleteSeat_NotFound() {
        when(seatRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> seatService.deleteSeat(999L))
                .isInstanceOf(SeatNotFoundException.class);
    }
}

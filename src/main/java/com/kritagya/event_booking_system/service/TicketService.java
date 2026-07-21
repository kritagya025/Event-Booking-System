package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.TicketResponseDTO;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Ticket;
import com.kritagya.event_booking_system.enums.TicketStatus;
import com.kritagya.event_booking_system.exception.BookingNotFoundException;
import com.kritagya.event_booking_system.mapper.TicketMapper;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;

    public TicketService(TicketRepository ticketRepository, BookingRepository bookingRepository) {
        this.ticketRepository = ticketRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<TicketResponseDTO> generateTickets(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        List<Ticket> tickets = new ArrayList<>();
        for (int i = 0; i < booking.getQuantity(); i++) {
            Ticket ticket = new Ticket(
                    UUID.randomUUID().toString(),
                    LocalDateTime.now(),
                    TicketStatus.ACTIVE,
                    booking
            );
            tickets.add(ticket);
        }

        List<Ticket> savedTickets = ticketRepository.saveAll(tickets);
        return savedTickets.stream()
                .map(TicketMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<TicketResponseDTO> getTicketsByBooking(Long bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new BookingNotFoundException(bookingId);
        }
        return ticketRepository.findByBookingId(bookingId)
                .stream()
                .map(TicketMapper::toDTO)
                .collect(Collectors.toList());
    }

    public TicketResponseDTO getTicket(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
        return TicketMapper.toDTO(ticket);
    }
}

package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.TicketResponseDTO;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.Ticket;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.enums.BookingStatus;
import com.kritagya.event_booking_system.enums.Role;
import com.kritagya.event_booking_system.enums.TicketStatus;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private QrCodeService qrCodeService;

    @InjectMocks
    private TicketService ticketService;

    private User owner;
    private User otherUser;
    private User admin;
    private Booking booking;
    private Ticket ticket;

    @BeforeEach
    void setUp() {
        owner = new User("John", "Smith", "john@test.com", "pass", "1234567890", Role.CUSTOMER);
        owner.setId(10L);

        otherUser = new User("Jane", "Doe", "jane@test.com", "pass", "0987654321", Role.CUSTOMER);
        otherUser.setId(20L);

        admin = new User("Admin", "Root", "admin@test.com", "pass", "1112223333", Role.ADMIN);
        admin.setId(1L);

        Event event = new Event();
        ReflectionTestUtils.setField(event, "id", 100L);
        event.setName("Jazz Night");

        booking = new Booking(LocalDateTime.now(), BookingStatus.CONFIRMED, 2, new BigDecimal("150.00"), owner, event);
        ReflectionTestUtils.setField(booking, "id", 500L);

        ticket = new Ticket("TKT-ABC12345", LocalDateTime.now(), TicketStatus.ACTIVE, booking);
        ReflectionTestUtils.setField(ticket, "id", 1L);
    }

    @Test
    @DisplayName("generateTickets creates specified quantity of tickets")
    void testGenerateTickets_Success() {
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));
        when(ticketRepository.findByBookingId(500L)).thenReturn(new ArrayList<>());
        when(ticketRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<TicketResponseDTO> tickets = ticketService.generateTickets(500L, owner);

        assertThat(tickets).hasSize(2);
        verify(ticketRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("generateTickets returns existing tickets if already generated")
    void testGenerateTickets_DuplicatePrevention() {
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));
        when(ticketRepository.findByBookingId(500L)).thenReturn(List.of(ticket));

        List<TicketResponseDTO> tickets = ticketService.generateTickets(500L, owner);

        assertThat(tickets).hasSize(1);
        verify(ticketRepository, never()).saveAll(anyList());
    }

    @Test
    @DisplayName("generateTickets throws AccessDeniedException when another user attempts generation")
    void testGenerateTickets_AccessDenied() {
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> ticketService.generateTickets(500L, otherUser))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("getTicket returns ticket when accessed by ticket owner")
    void testGetTicket_Success() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        TicketResponseDTO response = ticketService.getTicket(1L, owner);

        assertThat(response).isNotNull();
        assertThat(response.getQrCode()).isEqualTo("TKT-ABC12345");
    }

    @Test
    @DisplayName("getTicket throws AccessDeniedException when non-admin accesses another user's ticket")
    void testGetTicket_AccessDenied() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.getTicket(1L, otherUser))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("validateTicket returns DTO for valid active ticket QR")
    void testValidateTicket_Success() {
        when(ticketRepository.findByQrCode("TKT-ABC12345")).thenReturn(Optional.of(ticket));

        TicketResponseDTO response = ticketService.validateTicket("TKT-ABC12345");

        assertThat(response).isNotNull();
        assertThat(response.getTicketStatus()).isEqualTo(TicketStatus.ACTIVE.name());
    }

    @Test
    @DisplayName("validateTicket throws IllegalArgumentException when ticket is already used")
    void testValidateTicket_AlreadyUsed() {
        ticket.setTicketStatus(TicketStatus.USED);
        when(ticketRepository.findByQrCode("TKT-ABC12345")).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.validateTicket("TKT-ABC12345"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already been used");
    }

    @Test
    @DisplayName("checkIn marks ticket as USED with checkInTime")
    void testCheckIn_Success() {
        when(ticketRepository.findByQrCode("TKT-ABC12345")).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TicketResponseDTO response = ticketService.checkIn("TKT-ABC12345");

        assertThat(response.getTicketStatus()).isEqualTo(TicketStatus.USED.name());
        assertThat(ticket.getCheckInTime()).isNotNull();
        verify(ticketRepository).save(ticket);
    }

    @Test
    @DisplayName("validateTicketById returns DTO for valid ticket ID")
    void testValidateTicketById_Success() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        TicketResponseDTO response = ticketService.validateTicketById(1L);

        assertThat(response).isNotNull();
        assertThat(response.getTicketStatus()).isEqualTo(TicketStatus.ACTIVE.name());
    }

    @Test
    @DisplayName("checkInById marks ticket as USED with timestamp")
    void testCheckInById_Success() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TicketResponseDTO response = ticketService.checkInById(1L);

        assertThat(response.getTicketStatus()).isEqualTo(TicketStatus.USED.name());
        assertThat(ticket.getCheckInTime()).isNotNull();
        verify(ticketRepository).save(ticket);
    }

    @Test
    @DisplayName("generateTicketPdf throws IllegalStateException for cancelled ticket")
    void testGenerateTicketPdf_Cancelled() {
        ticket.setTicketStatus(TicketStatus.CANCELLED);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.generateTicketPdf(1L, owner))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot download PDF for a cancelled ticket");
    }
}

package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.PaymentRequestDTO;
import com.kritagya.event_booking_system.dto.PaymentResponseDTO;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.Payment;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.enums.BookingStatus;
import com.kritagya.event_booking_system.enums.PaymentMethod;
import com.kritagya.event_booking_system.enums.PaymentStatus;
import com.kritagya.event_booking_system.enums.Role;
import com.kritagya.event_booking_system.exception.BookingNotFoundException;
import com.kritagya.event_booking_system.logging.AuditLogger;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.PaymentRepository;
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
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private AuditLogger auditLogger;

    @Mock
    private TicketService ticketService;

    @InjectMocks
    private PaymentService paymentService;

    private User owner;
    private User otherUser;
    private User admin;
    private Booking booking;

    @BeforeEach
    void setUp() {
        owner = new User("Alice", "Smith", "alice@test.com", "pass123", "1234567890", Role.CUSTOMER);
        owner.setId(10L);

        otherUser = new User("Bob", "Brown", "bob@test.com", "pass123", "0987654321", Role.CUSTOMER);
        otherUser.setId(20L);

        admin = new User("Admin", "Root", "admin@test.com", "pass123", "1112223333", Role.ADMIN);
        admin.setId(1L);

        booking = new Booking(LocalDateTime.now(), BookingStatus.PENDING, 2, new BigDecimal("120.00"), owner, new Event());
        ReflectionTestUtils.setField(booking, "id", 100L);
    }

    @Test
    @DisplayName("createPayment succeeds for booking owner and confirms booking")
    void testCreatePayment_Success_Owner() {
        PaymentRequestDTO request = new PaymentRequestDTO(100L, "CREDIT_CARD");

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            ReflectionTestUtils.setField(p, "id", 500L);
            return p;
        });

        PaymentResponseDTO response = paymentService.createPayment(request, owner);

        assertThat(response).isNotNull();
        assertThat(response.getPaymentMethod()).isEqualTo("CREDIT_CARD");
        assertThat(response.getPaymentStatus()).isEqualTo(PaymentStatus.COMPLETED.name());
        assertThat(booking.getBookingStatus()).isEqualTo(BookingStatus.CONFIRMED);

        verify(bookingRepository).save(booking);
        verify(ticketService).generateTickets(100L, owner);
        verify(auditLogger).logPaymentProcessed(eq(500L), eq(100L), eq("CREDIT_CARD"), eq("COMPLETED"), any());
    }

    @Test
    @DisplayName("createPayment succeeds for admin on behalf of any booking")
    void testCreatePayment_Success_Admin() {
        PaymentRequestDTO request = new PaymentRequestDTO(100L, "UPI");

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            ReflectionTestUtils.setField(p, "id", 501L);
            return p;
        });

        PaymentResponseDTO response = paymentService.createPayment(request, admin);

        assertThat(response).isNotNull();
        assertThat(response.getPaymentMethod()).isEqualTo("UPI");
        verify(bookingRepository).save(booking);
    }

    @Test
    @DisplayName("createPayment throws AccessDeniedException when another customer attempts payment")
    void testCreatePayment_AccessDenied() {
        PaymentRequestDTO request = new PaymentRequestDTO(100L, "DEBIT_CARD");
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> paymentService.createPayment(request, otherUser))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("not authorized");

        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("createPayment throws BookingNotFoundException if booking does not exist")
    void testCreatePayment_NotFound() {
        PaymentRequestDTO request = new PaymentRequestDTO(999L, "CREDIT_CARD");
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.createPayment(request, owner))
                .isInstanceOf(BookingNotFoundException.class);
    }

    @Test
    @DisplayName("getPayment returns payment for booking owner")
    void testGetPayment_Success_Owner() {
        Payment payment = new Payment(new BigDecimal("120.00"), PaymentMethod.CREDIT_CARD,
                PaymentStatus.COMPLETED, "TXN-12345", booking);
        ReflectionTestUtils.setField(payment, "id", 500L);

        when(paymentRepository.findById(500L)).thenReturn(Optional.of(payment));

        PaymentResponseDTO response = paymentService.getPayment(500L, owner);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(500L);
        assertThat(response.getTransactionId()).isEqualTo("TXN-12345");
    }

    @Test
    @DisplayName("getPayment throws AccessDeniedException when non-admin accesses another's payment")
    void testGetPayment_AccessDenied() {
        Payment payment = new Payment(new BigDecimal("120.00"), PaymentMethod.CREDIT_CARD,
                PaymentStatus.COMPLETED, "TXN-12345", booking);
        ReflectionTestUtils.setField(payment, "id", 500L);

        when(paymentRepository.findById(500L)).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> paymentService.getPayment(500L, otherUser))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("getPaymentByBooking returns payment for valid booking")
    void testGetPaymentByBooking_Success() {
        Payment payment = new Payment(new BigDecimal("120.00"), PaymentMethod.CREDIT_CARD,
                PaymentStatus.COMPLETED, "TXN-12345", booking);
        ReflectionTestUtils.setField(payment, "id", 500L);

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.of(payment));

        PaymentResponseDTO response = paymentService.getPaymentByBooking(100L, owner);
        assertThat(response).isNotNull();
    }

    @Test
    @DisplayName("getAllPayments returns all payments")
    void testGetAllPayments() {
        Payment payment1 = new Payment(new BigDecimal("50.00"), PaymentMethod.UPI, PaymentStatus.COMPLETED, "TXN-1", booking);
        Payment payment2 = new Payment(new BigDecimal("75.00"), PaymentMethod.NET_BANKING, PaymentStatus.COMPLETED, "TXN-2", booking);

        when(paymentRepository.findAll()).thenReturn(List.of(payment1, payment2));

        List<PaymentResponseDTO> payments = paymentService.getAllPayments();
        assertThat(payments).hasSize(2);
    }
}

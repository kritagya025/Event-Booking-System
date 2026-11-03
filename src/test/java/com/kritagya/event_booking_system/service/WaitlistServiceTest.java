package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.entity.Waitlist;
import com.kritagya.event_booking_system.enums.Role;
import com.kritagya.event_booking_system.enums.WaitlistStatus;
import com.kritagya.event_booking_system.exception.EventNotFoundException;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.WaitlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WaitlistServiceTest {

    @Mock
    private WaitlistRepository waitlistRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private WaitlistService waitlistService;

    private User user;
    private Event soldOutEvent;
    private Event availableEvent;
    private Waitlist waitingEntry;

    @BeforeEach
    void setUp() {
        user = new User("John", "Doe", "john@test.com", "secret", "1234567890", Role.CUSTOMER);
        user.setId(10L);

        soldOutEvent = new Event();
        ReflectionTestUtils.setField(soldOutEvent, "id", 100L);
        soldOutEvent.setName("Mega Festival");
        soldOutEvent.setAvailableSeats(0);

        availableEvent = new Event();
        ReflectionTestUtils.setField(availableEvent, "id", 101L);
        availableEvent.setName("Open Workshop");
        availableEvent.setAvailableSeats(25);

        waitingEntry = new Waitlist(user, soldOutEvent);
        ReflectionTestUtils.setField(waitingEntry, "id", 1L);
    }

    @Test
    @DisplayName("joinWaitlist succeeds when event is sold out and user is not already waiting")
    void testJoinWaitlist_Success() {
        when(eventRepository.findByIdAndDeletedFalse(100L)).thenReturn(Optional.of(soldOutEvent));
        when(waitlistRepository.existsByUserIdAndEventIdAndStatus(10L, 100L, WaitlistStatus.WAITING)).thenReturn(false);

        waitlistService.joinWaitlist(100L, user);

        verify(waitlistRepository).save(any(Waitlist.class));
    }

    @Test
    @DisplayName("joinWaitlist throws IllegalArgumentException when event still has available seats")
    void testJoinWaitlist_EventNotSoldOut() {
        when(eventRepository.findByIdAndDeletedFalse(101L)).thenReturn(Optional.of(availableEvent));

        assertThatThrownBy(() -> waitlistService.joinWaitlist(101L, user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("only available when the event is sold out");
    }

    @Test
    @DisplayName("joinWaitlist throws IllegalArgumentException when user already on waitlist")
    void testJoinWaitlist_AlreadyOnWaitlist() {
        when(eventRepository.findByIdAndDeletedFalse(100L)).thenReturn(Optional.of(soldOutEvent));
        when(waitlistRepository.existsByUserIdAndEventIdAndStatus(10L, 100L, WaitlistStatus.WAITING)).thenReturn(true);

        assertThatThrownBy(() -> waitlistService.joinWaitlist(100L, user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already on the waitlist");
    }

    @Test
    @DisplayName("joinWaitlist throws EventNotFoundException when event not found")
    void testJoinWaitlist_EventNotFound() {
        when(eventRepository.findByIdAndDeletedFalse(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> waitlistService.joinWaitlist(999L, user))
                .isInstanceOf(EventNotFoundException.class);
    }

    @Test
    @DisplayName("leaveWaitlist cancels active waitlist entry")
    void testLeaveWaitlist_Success() {
        when(waitlistRepository.findByUserIdAndEventId(10L, 100L)).thenReturn(Optional.of(waitingEntry));

        waitlistService.leaveWaitlist(100L, user);

        assertThat(waitingEntry.getStatus()).isEqualTo(WaitlistStatus.CANCELLED);
        verify(waitlistRepository).save(waitingEntry);
    }

    @Test
    @DisplayName("leaveWaitlist throws IllegalArgumentException when user not on active waitlist")
    void testLeaveWaitlist_NotActive() {
        waitingEntry.setStatus(WaitlistStatus.CANCELLED);
        when(waitlistRepository.findByUserIdAndEventId(10L, 100L)).thenReturn(Optional.of(waitingEntry));

        assertThatThrownBy(() -> waitlistService.leaveWaitlist(100L, user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not currently on the active waitlist");
    }

    @Test
    @DisplayName("autoPromoteFirstWaitingUser promotes first waiting user and notifies via email")
    void testAutoPromoteFirstWaitingUser_Success() {
        when(waitlistRepository.findByEventIdAndStatusOrderByCreatedAtAsc(100L, WaitlistStatus.WAITING))
                .thenReturn(List.of(waitingEntry));
        when(eventRepository.findById(100L)).thenReturn(Optional.of(soldOutEvent));

        waitlistService.autoPromoteFirstWaitingUser(100L);

        assertThat(waitingEntry.getStatus()).isEqualTo(WaitlistStatus.NOTIFIED);
        verify(waitlistRepository).save(waitingEntry);
        verify(emailService).sendWaitlistPromotionEmail(user, soldOutEvent);
    }

    @Test
    @DisplayName("autoPromoteFirstWaitingUser does nothing when waitlist is empty")
    void testAutoPromoteFirstWaitingUser_Empty() {
        when(waitlistRepository.findByEventIdAndStatusOrderByCreatedAtAsc(100L, WaitlistStatus.WAITING))
                .thenReturn(List.of());

        waitlistService.autoPromoteFirstWaitingUser(100L);

        verify(waitlistRepository, never()).save(any(Waitlist.class));
        verify(emailService, never()).sendWaitlistPromotionEmail(any(), any());
    }

    @Test
    @DisplayName("getUserWaitlistStatus returns status name or NONE")
    void testGetUserWaitlistStatus() {
        when(waitlistRepository.findByUserIdAndEventId(10L, 100L)).thenReturn(Optional.of(waitingEntry));

        String status = waitlistService.getUserWaitlistStatus(100L, user);
        assertThat(status).isEqualTo("WAITING");

        assertThat(waitlistService.getUserWaitlistStatus(100L, null)).isEqualTo("NONE");
    }

    @Test
    @DisplayName("getWaitlistCount returns queue count from repository")
    void testGetWaitlistCount() {
        when(waitlistRepository.countByEventIdAndStatus(100L, WaitlistStatus.WAITING)).thenReturn(4L);

        Long count = waitlistService.getWaitlistCount(100L);
        assertThat(count).isEqualTo(4L);
    }
}


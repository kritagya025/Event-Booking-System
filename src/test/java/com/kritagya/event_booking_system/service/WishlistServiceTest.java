package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.entity.Wishlist;
import com.kritagya.event_booking_system.enums.Role;
import com.kritagya.event_booking_system.exception.EventNotFoundException;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.WishlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WishlistServiceTest {

    @Mock
    private WishlistRepository wishlistRepository;

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private WishlistService wishlistService;

    private User user;
    private Event event;
    private Venue venue;

    @BeforeEach
    void setUp() {
        user = new User("Emma", "Watson", "emma@test.com", "pass", "1234567890", Role.CUSTOMER);
        user.setId(5L);

        venue = new Venue("Royal Theatre", "77 Broadway", 1200, "Historical venue");
        ReflectionTestUtils.setField(venue, "id", 1L);

        event = new Event();
        ReflectionTestUtils.setField(event, "id", 200L);
        event.setName("Hamlet Theater Play");
        event.setEventDate(LocalDate.now().plusDays(15));
        event.setVenue(venue);
        event.setDeleted(false);
    }

    @Test
    @DisplayName("addToWishlist successfully saves wishlist entry when not already present")
    void testAddToWishlist_Success() {
        when(eventRepository.findByIdAndDeletedFalse(200L)).thenReturn(Optional.of(event));
        when(wishlistRepository.existsByUserIdAndEventId(5L, 200L)).thenReturn(false);

        wishlistService.addToWishlist(200L, user);

        verify(wishlistRepository).save(any(Wishlist.class));
    }

    @Test
    @DisplayName("addToWishlist does nothing when event already bookmarked in wishlist")
    void testAddToWishlist_AlreadyPresent() {
        when(eventRepository.findByIdAndDeletedFalse(200L)).thenReturn(Optional.of(event));
        when(wishlistRepository.existsByUserIdAndEventId(5L, 200L)).thenReturn(true);

        wishlistService.addToWishlist(200L, user);

        verify(wishlistRepository, never()).save(any(Wishlist.class));
    }

    @Test
    @DisplayName("addToWishlist throws EventNotFoundException when event not found or deleted")
    void testAddToWishlist_EventNotFound() {
        when(eventRepository.findByIdAndDeletedFalse(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> wishlistService.addToWishlist(999L, user))
                .isInstanceOf(EventNotFoundException.class);
    }

    @Test
    @DisplayName("removeFromWishlist deletes item when event exists")
    void testRemoveFromWishlist_Success() {
        when(eventRepository.existsById(200L)).thenReturn(true);

        wishlistService.removeFromWishlist(200L, user);

        verify(wishlistRepository).deleteByUserIdAndEventId(5L, 200L);
    }

    @Test
    @DisplayName("removeFromWishlist throws EventNotFoundException when event does not exist")
    void testRemoveFromWishlist_EventNotFound() {
        when(eventRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> wishlistService.removeFromWishlist(999L, user))
                .isInstanceOf(EventNotFoundException.class);
    }

    @Test
    @DisplayName("getUserWishlist returns list of events in user wishlist")
    void testGetUserWishlist_Success() {
        Wishlist wishlist = new Wishlist(user, event);
        when(wishlistRepository.findByUserId(5L)).thenReturn(List.of(wishlist));

        List<EventResponseDTO> result = wishlistService.getUserWishlist(user);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(200L);
        assertThat(result.get(0).getName()).isEqualTo("Hamlet Theater Play");
    }

    @Test
    @DisplayName("isEventWishlisted returns true when item exists in repository")
    void testIsEventWishlisted_True() {
        when(wishlistRepository.existsByUserIdAndEventId(5L, 200L)).thenReturn(true);

        boolean result = wishlistService.isEventWishlisted(200L, user);

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("isEventWishlisted returns false when item does not exist or user is null")
    void testIsEventWishlisted_FalseAndNull() {
        when(wishlistRepository.existsByUserIdAndEventId(5L, 200L)).thenReturn(false);

        assertThat(wishlistService.isEventWishlisted(200L, user)).isFalse();
        assertThat(wishlistService.isEventWishlisted(200L, null)).isFalse();
    }
}

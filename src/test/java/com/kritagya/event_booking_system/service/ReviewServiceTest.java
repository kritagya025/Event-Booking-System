package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.EventReviewSummaryDTO;
import com.kritagya.event_booking_system.dto.ReviewRequestDTO;
import com.kritagya.event_booking_system.dto.ReviewResponseDTO;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.Review;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.enums.BookingStatus;
import com.kritagya.event_booking_system.enums.Role;
import com.kritagya.event_booking_system.exception.EventNotFoundException;
import com.kritagya.event_booking_system.exception.ResourceNotFoundException;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User customer;
    private User otherCustomer;
    private User admin;
    private Event event;
    private Booking confirmedBooking;
    private Review review;

    @BeforeEach
    void setUp() {
        customer = new User("Alice", "Smith", "alice@test.com", "pass", "1234567890", Role.CUSTOMER);
        customer.setId(10L);

        otherCustomer = new User("Bob", "Jones", "bob@test.com", "pass", "0987654321", Role.CUSTOMER);
        otherCustomer.setId(20L);

        admin = new User("Admin", "User", "admin@test.com", "pass", "1112223333", Role.ADMIN);
        admin.setId(1L);

        event = new Event();
        ReflectionTestUtils.setField(event, "id", 100L);
        event.setName("Rock Concert");
        event.setEventDate(LocalDate.now().plusDays(10));

        confirmedBooking = new Booking(LocalDateTime.now(), BookingStatus.CONFIRMED, 2, new BigDecimal("100.00"), customer, event);

        review = new Review(5, "Amazing concert!", customer, event);
        ReflectionTestUtils.setField(review, "id", 50L);
    }

    @Test
    @DisplayName("addReview succeeds when user has confirmed booking")
    void testAddReview_Success() {
        ReviewRequestDTO request = new ReviewRequestDTO(5, "Amazing concert!");

        when(eventRepository.findByIdAndDeletedFalse(100L)).thenReturn(Optional.of(event));
        when(bookingRepository.findByUserId(10L)).thenReturn(List.of(confirmedBooking));
        when(reviewRepository.existsByUserIdAndEventId(10L, 100L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> {
            Review r = invocation.getArgument(0);
            ReflectionTestUtils.setField(r, "id", 50L);
            return r;
        });

        ReviewResponseDTO response = reviewService.addReview(100L, request, customer);

        assertThat(response).isNotNull();
        assertThat(response.getRating()).isEqualTo(5);
        assertThat(response.getComment()).isEqualTo("Amazing concert!");
        assertThat(response.getUserName()).isEqualTo("Alice Smith");
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    @DisplayName("addReview throws IllegalArgumentException when user has no confirmed booking")
    void testAddReview_NoConfirmedBooking() {
        ReviewRequestDTO request = new ReviewRequestDTO(4, "Nice show");

        when(eventRepository.findByIdAndDeletedFalse(100L)).thenReturn(Optional.of(event));
        when(bookingRepository.findByUserId(20L)).thenReturn(List.of());

        assertThatThrownBy(() -> reviewService.addReview(100L, request, otherCustomer))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("confirmed booking");
    }

    @Test
    @DisplayName("addReview throws IllegalArgumentException when user already reviewed event")
    void testAddReview_DuplicateReview() {
        ReviewRequestDTO request = new ReviewRequestDTO(5, "Duplicate review");

        when(eventRepository.findByIdAndDeletedFalse(100L)).thenReturn(Optional.of(event));
        when(bookingRepository.findByUserId(10L)).thenReturn(List.of(confirmedBooking));
        when(reviewRepository.existsByUserIdAndEventId(10L, 100L)).thenReturn(true);

        assertThatThrownBy(() -> reviewService.addReview(100L, request, customer))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already reviewed");
    }

    @Test
    @DisplayName("getEventReviews returns 0.0 rating gracefully when event has no reviews")
    void testGetEventReviews_NoReviews_GracefulZeroRating() {
        Pageable pageable = PageRequest.of(0, 10);
        when(eventRepository.existsById(100L)).thenReturn(true);
        when(reviewRepository.findByEventId(100L, pageable)).thenReturn(Page.empty());
        when(reviewRepository.getAverageRatingByEventId(100L)).thenReturn(null);
        when(reviewRepository.countByEventId(100L)).thenReturn(0L);

        EventReviewSummaryDTO summary = reviewService.getEventReviews(100L, pageable);

        assertThat(summary).isNotNull();
        assertThat(summary.getAverageRating()).isEqualTo(0.0);
        assertThat(summary.getTotalReviews()).isEqualTo(0L);
        assertThat(summary.getReviews().getContent()).isEmpty();
    }

    @Test
    @DisplayName("getEventReviews returns rounded average rating when reviews exist")
    void testGetEventReviews_WithReviews() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Review> reviewPage = new PageImpl<>(List.of(review));

        when(eventRepository.existsById(100L)).thenReturn(true);
        when(reviewRepository.findByEventId(100L, pageable)).thenReturn(reviewPage);
        when(reviewRepository.getAverageRatingByEventId(100L)).thenReturn(4.6666);
        when(reviewRepository.countByEventId(100L)).thenReturn(1L);

        EventReviewSummaryDTO summary = reviewService.getEventReviews(100L, pageable);

        assertThat(summary).isNotNull();
        assertThat(summary.getAverageRating()).isEqualTo(4.7);
        assertThat(summary.getTotalReviews()).isEqualTo(1L);
        assertThat(summary.getReviews().getContent()).hasSize(1);
    }

    @Test
    @DisplayName("getEventReviews throws EventNotFoundException when event does not exist")
    void testGetEventReviews_EventNotFound() {
        when(eventRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> reviewService.getEventReviews(999L, PageRequest.of(0, 10)))
                .isInstanceOf(EventNotFoundException.class);
    }

    @Test
    @DisplayName("editReview succeeds for review owner")
    void testEditReview_Success_Owner() {
        ReviewRequestDTO request = new ReviewRequestDTO(4, "Updated comment");
        when(reviewRepository.findById(50L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReviewResponseDTO response = reviewService.editReview(50L, request, customer);

        assertThat(response.getRating()).isEqualTo(4);
        assertThat(response.getComment()).isEqualTo("Updated comment");
        verify(reviewRepository).save(review);
    }

    @Test
    @DisplayName("editReview throws AccessDeniedException when another user attempts edit")
    void testEditReview_AccessDenied() {
        ReviewRequestDTO request = new ReviewRequestDTO(4, "Hacked comment");
        when(reviewRepository.findById(50L)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> reviewService.editReview(50L, request, otherCustomer))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("deleteReview succeeds for admin")
    void testDeleteReview_Success_Admin() {
        when(reviewRepository.findById(50L)).thenReturn(Optional.of(review));

        reviewService.deleteReview(50L, admin);

        verify(reviewRepository).delete(review);
    }

    @Test
    @DisplayName("deleteReview throws ResourceNotFoundException when review does not exist")
    void testDeleteReview_NotFound() {
        when(reviewRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.deleteReview(999L, customer))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}

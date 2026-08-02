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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         EventRepository eventRepository,
                         BookingRepository bookingRepository) {
        this.reviewRepository = reviewRepository;
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public ReviewResponseDTO addReview(Long eventId, ReviewRequestDTO request, User user) {
        Event event = eventRepository.findByIdAndDeletedFalse(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        // Requirement: Users can review ONLY attended/confirmed events
        List<Booking> userBookings = bookingRepository.findByUserId(user.getId());
        boolean hasConfirmedBooking = userBookings.stream()
                .anyMatch(b -> b.getEvent().getId().equals(eventId) && b.getBookingStatus() == BookingStatus.CONFIRMED);

        if (!hasConfirmedBooking) {
            throw new IllegalArgumentException("You can only review events you have a confirmed booking for.");
        }

        // Requirement: Prevent duplicate reviews
        if (reviewRepository.existsByUserIdAndEventId(user.getId(), eventId)) {
            throw new IllegalArgumentException("You have already reviewed this event.");
        }

        Review review = new Review(request.getRating(), request.getComment(), user, event);
        Review savedReview = reviewRepository.save(review);

        return mapToDTO(savedReview);
    }

    @Transactional(readOnly = true)
    public EventReviewSummaryDTO getEventReviews(Long eventId, Pageable pageable) {
        if (!eventRepository.existsById(eventId)) {
            throw new EventNotFoundException(eventId);
        }

        Page<ReviewResponseDTO> reviews = reviewRepository.findByEventId(eventId, pageable)
                .map(this::mapToDTO);

        Double avgRating = reviewRepository.getAverageRatingByEventId(eventId);
        Long totalReviews = reviewRepository.countByEventId(eventId);

        return new EventReviewSummaryDTO(eventId, Math.round(avgRating * 10.0) / 10.0, totalReviews, reviews);
    }

    @Transactional
    public ReviewResponseDTO editReview(Long reviewId, ReviewRequestDTO request, User user) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!review.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to edit this review.");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        Review updatedReview = reviewRepository.save(review);

        return mapToDTO(updatedReview);
    }

    @Transactional
    public void deleteReview(Long reviewId, User user) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!review.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to delete this review.");
        }

        reviewRepository.delete(review);
    }

    private ReviewResponseDTO mapToDTO(Review review) {
        String userName = review.getUser().getFirstName() + " " + review.getUser().getLastName();
        return new ReviewResponseDTO(
                review.getId(),
                review.getRating(),
                review.getComment(),
                review.getUser().getId(),
                userName,
                review.getEvent().getId(),
                review.getCreatedAt()
        );
    }
}

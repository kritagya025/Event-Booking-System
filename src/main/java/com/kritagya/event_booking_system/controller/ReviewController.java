package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.EventReviewSummaryDTO;
import com.kritagya.event_booking_system.dto.ReviewRequestDTO;
import com.kritagya.event_booking_system.dto.ReviewResponseDTO;
import com.kritagya.event_booking_system.security.CustomUserDetails;
import com.kritagya.event_booking_system.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/events/{eventId}/reviews")
    public ResponseEntity<ReviewResponseDTO> addReview(
            @PathVariable Long eventId,
            @Valid @RequestBody ReviewRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReviewResponseDTO response = reviewService.addReview(eventId, request, userDetails.getUser());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/events/{eventId}/reviews")
    public ResponseEntity<EventReviewSummaryDTO> getEventReviews(
            @PathVariable Long eventId,
            @PageableDefault(size = 10) Pageable pageable) {
        EventReviewSummaryDTO summary = reviewService.getEventReviews(eventId, pageable);
        return ResponseEntity.ok(summary);
    }

    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<ReviewResponseDTO> editReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReviewResponseDTO response = reviewService.editReview(reviewId, request, userDetails.getUser());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        reviewService.deleteReview(reviewId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }
}

package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.security.CustomUserDetails;
import com.kritagya.event_booking_system.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @PostMapping("/{eventId}")
    public ResponseEntity<Void> addToWishlist(
            @PathVariable Long eventId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        wishlistService.addToWishlist(eventId, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Long eventId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        wishlistService.removeFromWishlist(eventId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getWishlist(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<EventResponseDTO> wishlist = wishlistService.getUserWishlist(userDetails.getUser());
        return ResponseEntity.ok(wishlist);
    }
}

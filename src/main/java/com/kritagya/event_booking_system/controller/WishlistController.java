package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.security.CustomUserDetails;
import com.kritagya.event_booking_system.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@Tag(name = "Wishlist", description = "Endpoints for user event bookmarking, wishlist querying, and status checking")
@SecurityRequirement(name = "Bearer Authentication")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @PostMapping("/{eventId}")
    @Operation(summary = "Add event to wishlist", description = "Bookmarks an event to the authenticated user's personal wishlist")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Event added to wishlist"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<Void> addToWishlist(
            @Parameter(description = "ID of the event to bookmark") @PathVariable Long eventId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        wishlistService.addToWishlist(eventId, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{eventId}")
    @Operation(summary = "Remove event from wishlist", description = "Removes an event from the authenticated user's wishlist")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Event removed from wishlist"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<Void> removeFromWishlist(
            @Parameter(description = "ID of the event to remove") @PathVariable Long eventId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        wishlistService.removeFromWishlist(eventId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get user wishlist", description = "Retrieves all saved events currently in the authenticated user's wishlist")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Wishlist retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<EventResponseDTO>> getWishlist(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<EventResponseDTO> wishlist = wishlistService.getUserWishlist(userDetails.getUser());
        return ResponseEntity.ok(wishlist);
    }

    @GetMapping("/{eventId}/status")
    @Operation(summary = "Check event wishlist status", description = "Checks whether a specific event is in the current user's wishlist")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Wishlist status returned"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Boolean>> isEventWishlisted(
            @Parameter(description = "ID of the event to check") @PathVariable Long eventId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean isWishlisted = wishlistService.isEventWishlisted(eventId, userDetails.getUser());
        return ResponseEntity.ok(Map.of("isWishlisted", isWishlisted));
    }
}

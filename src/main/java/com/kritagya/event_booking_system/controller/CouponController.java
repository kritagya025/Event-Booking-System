package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.CouponRequestDTO;
import com.kritagya.event_booking_system.dto.CouponResponseDTO;
import com.kritagya.event_booking_system.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@Tag(name = "Coupons", description = "Endpoints for discount coupon creation, validation, status management, and deletion")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create a discount coupon", description = "Registers a new discount coupon. Requires ADMIN role.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Coupon created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid coupon payload or duplicate code"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    public ResponseEntity<CouponResponseDTO> createCoupon(@Valid @RequestBody CouponRequestDTO request) {
        CouponResponseDTO response = couponService.createCoupon(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate coupon code", description = "Validates active status, expiry, usage limit, and minimum booking amount.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Coupon is valid and returned"),
            @ApiResponse(responseCode = "400", description = "Coupon constraints not satisfied or expired"),
            @ApiResponse(responseCode = "404", description = "Coupon not found")
    })
    public ResponseEntity<CouponResponseDTO> validateCoupon(
            @Parameter(description = "Coupon code string") @RequestParam String code,
            @Parameter(description = "Booking amount to test minimum threshold") @RequestParam(required = false) BigDecimal bookingAmount) {
        CouponResponseDTO response = couponService.validateCoupon(code, bookingAmount);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "List all coupons", description = "Retrieves all promotional coupons across the system. Requires ADMIN role.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Coupons retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    public ResponseEntity<List<CouponResponseDTO>> getAllCoupons() {
        List<CouponResponseDTO> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(coupons);
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Toggle coupon active status", description = "Enables or disables a coupon without deleting it. Requires ADMIN role.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Coupon status toggled successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role"),
            @ApiResponse(responseCode = "404", description = "Coupon not found")
    })
    public ResponseEntity<CouponResponseDTO> toggleCouponStatus(
            @Parameter(description = "Coupon ID") @PathVariable Long id) {
        CouponResponseDTO response = couponService.toggleCouponStatus(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete coupon", description = "Permanently removes a coupon. Requires ADMIN role.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Coupon deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role"),
            @ApiResponse(responseCode = "404", description = "Coupon not found")
    })
    public ResponseEntity<Void> deleteCoupon(
            @Parameter(description = "Coupon ID") @PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }
}

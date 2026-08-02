package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.CouponRequestDTO;
import com.kritagya.event_booking_system.dto.CouponResponseDTO;
import com.kritagya.event_booking_system.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponseDTO> createCoupon(@Valid @RequestBody CouponRequestDTO request) {
        CouponResponseDTO response = couponService.createCoupon(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/validate")
    public ResponseEntity<CouponResponseDTO> validateCoupon(
            @RequestParam String code,
            @RequestParam(required = false) BigDecimal bookingAmount) {
        CouponResponseDTO response = couponService.validateCoupon(code, bookingAmount);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CouponResponseDTO>> getAllCoupons() {
        List<CouponResponseDTO> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(coupons);
    }
}

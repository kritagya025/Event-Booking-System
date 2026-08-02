package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.CouponRequestDTO;
import com.kritagya.event_booking_system.dto.CouponResponseDTO;
import com.kritagya.event_booking_system.entity.Coupon;
import com.kritagya.event_booking_system.enums.DiscountType;
import com.kritagya.event_booking_system.exception.ResourceNotFoundException;
import com.kritagya.event_booking_system.repository.CouponRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService {

    private static final Logger log = LoggerFactory.getLogger(CouponService.class);

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Transactional
    public CouponResponseDTO createCoupon(CouponRequestDTO request) {
        if (couponRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new IllegalArgumentException("Coupon code already exists: " + request.getCode());
        }

        DiscountType discountType = DiscountType.valueOf(request.getDiscountType().toUpperCase());

        Coupon coupon = new Coupon(
                request.getCode().toUpperCase(),
                discountType,
                request.getDiscountValue(),
                request.getExpiryDate(),
                request.getUsageLimit(),
                request.getMinBookingAmount()
        );

        Coupon savedCoupon = couponRepository.save(coupon);
        log.info("Coupon created: code={}, type={}, value={}", savedCoupon.getCode(),
                savedCoupon.getDiscountType(), savedCoupon.getDiscountValue());

        return mapToDTO(savedCoupon);
    }

    @Transactional(readOnly = true)
    public CouponResponseDTO validateCoupon(String code, BigDecimal bookingAmount) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + code));

        validateCouponConstraints(coupon, bookingAmount);

        return mapToDTO(coupon);
    }

    public BigDecimal calculateDiscount(String code, BigDecimal originalAmount, LocalDate eventDate) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + code));

        validateCouponConstraints(coupon, originalAmount);

        BigDecimal discount;
        switch (coupon.getDiscountType()) {
            case PERCENTAGE:
                discount = originalAmount.multiply(coupon.getDiscountValue())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                break;
            case FIXED:
                discount = coupon.getDiscountValue();
                break;
            case EARLY_BIRD:
                // Early bird: full discount if booking is more than 7 days before event, half otherwise
                if (eventDate != null && LocalDate.now().plusDays(7).isBefore(eventDate)) {
                    discount = originalAmount.multiply(coupon.getDiscountValue())
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                } else {
                    discount = originalAmount.multiply(coupon.getDiscountValue())
                            .divide(BigDecimal.valueOf(200), 2, RoundingMode.HALF_UP);
                }
                break;
            default:
                discount = BigDecimal.ZERO;
        }

        // Discount cannot exceed original amount
        if (discount.compareTo(originalAmount) > 0) {
            discount = originalAmount;
        }

        return discount;
    }

    @Transactional
    public void incrementUsage(String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + code));

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
    }

    @Transactional(readOnly = true)
    public List<CouponResponseDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private void validateCouponConstraints(Coupon coupon, BigDecimal bookingAmount) {
        if (!coupon.isActive()) {
            throw new IllegalArgumentException("Coupon is no longer active.");
        }
        if (coupon.getExpiryDate() != null && LocalDate.now().isAfter(coupon.getExpiryDate())) {
            throw new IllegalArgumentException("Coupon has expired.");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new IllegalArgumentException("Coupon usage limit has been reached.");
        }
        if (bookingAmount != null && coupon.getMinBookingAmount() != null
                && bookingAmount.compareTo(coupon.getMinBookingAmount()) < 0) {
            throw new IllegalArgumentException("Minimum booking amount of "
                    + coupon.getMinBookingAmount() + " required for this coupon.");
        }
    }

    private CouponResponseDTO mapToDTO(Coupon coupon) {
        return new CouponResponseDTO(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDiscountType().name(),
                coupon.getDiscountValue(),
                coupon.getExpiryDate(),
                coupon.getUsageLimit(),
                coupon.getUsedCount(),
                coupon.getMinBookingAmount(),
                coupon.isActive()
        );
    }
}

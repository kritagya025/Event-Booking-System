package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.CouponRequestDTO;
import com.kritagya.event_booking_system.dto.CouponResponseDTO;
import com.kritagya.event_booking_system.entity.Coupon;
import com.kritagya.event_booking_system.enums.DiscountType;
import com.kritagya.event_booking_system.repository.CouponRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private CouponService couponService;

    private Coupon percentageCoupon;
    private Coupon fixedCoupon;
    private Coupon earlyBirdCoupon;

    @BeforeEach
    void setUp() {
        percentageCoupon = new Coupon("SAVE20", DiscountType.PERCENTAGE, new BigDecimal("20"),
                LocalDate.now().plusDays(30), 100, new BigDecimal("50.00"));
        ReflectionTestUtils.setField(percentageCoupon, "id", 1L);

        fixedCoupon = new Coupon("FLAT15", DiscountType.FIXED, new BigDecimal("15"),
                LocalDate.now().plusDays(30), 50, new BigDecimal("30.00"));
        ReflectionTestUtils.setField(fixedCoupon, "id", 2L);

        earlyBirdCoupon = new Coupon("EARLYBIRD", DiscountType.EARLY_BIRD, new BigDecimal("20"),
                LocalDate.now().plusDays(30), 10, new BigDecimal("20.00"));
        ReflectionTestUtils.setField(earlyBirdCoupon, "id", 3L);
    }

    @Test
    @DisplayName("createCoupon creates new coupon with uppercase code")
    void testCreateCoupon_Success() {
        CouponRequestDTO request = new CouponRequestDTO("summer50", "PERCENTAGE",
                new BigDecimal("50"), LocalDate.now().plusMonths(1), 200, new BigDecimal("100"));

        when(couponRepository.existsByCode("SUMMER50")).thenReturn(false);
        when(couponRepository.save(any(Coupon.class))).thenAnswer(invocation -> {
            Coupon c = invocation.getArgument(0);
            ReflectionTestUtils.setField(c, "id", 10L);
            return c;
        });

        CouponResponseDTO response = couponService.createCoupon(request);

        assertThat(response).isNotNull();
        assertThat(response.getCode()).isEqualTo("SUMMER50");
        assertThat(response.getDiscountType()).isEqualTo("PERCENTAGE");
    }

    @Test
    @DisplayName("createCoupon throws IllegalArgumentException if code already exists")
    void testCreateCoupon_Duplicate() {
        CouponRequestDTO request = new CouponRequestDTO("save20", "PERCENTAGE",
                new BigDecimal("20"), LocalDate.now().plusMonths(1), 100, new BigDecimal("50"));

        when(couponRepository.existsByCode("SAVE20")).thenReturn(true);

        assertThatThrownBy(() -> couponService.createCoupon(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("validateCoupon returns DTO for valid coupon")
    void testValidateCoupon_Success() {
        when(couponRepository.findByCode("SAVE20")).thenReturn(Optional.of(percentageCoupon));

        CouponResponseDTO dto = couponService.validateCoupon("save20", new BigDecimal("100.00"));
        assertThat(dto).isNotNull();
        assertThat(dto.getCode()).isEqualTo("SAVE20");
    }

    @Test
    @DisplayName("validateCoupon throws if booking amount is less than minBookingAmount")
    void testValidateCoupon_MinAmountNotMet() {
        when(couponRepository.findByCode("SAVE20")).thenReturn(Optional.of(percentageCoupon));

        assertThatThrownBy(() -> couponService.validateCoupon("SAVE20", new BigDecimal("40.00")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Minimum booking amount");
    }

    @Test
    @DisplayName("calculateDiscount handles PERCENTAGE discounts accurately")
    void testCalculateDiscount_Percentage() {
        when(couponRepository.findByCode("SAVE20")).thenReturn(Optional.of(percentageCoupon));

        BigDecimal discount = couponService.calculateDiscount("SAVE20", new BigDecimal("200.00"), LocalDate.now().plusDays(10));
        assertThat(discount).isEqualByComparingTo(new BigDecimal("40.00"));
    }

    @Test
    @DisplayName("calculateDiscount handles FIXED discounts accurately")
    void testCalculateDiscount_Fixed() {
        when(couponRepository.findByCode("FLAT15")).thenReturn(Optional.of(fixedCoupon));

        BigDecimal discount = couponService.calculateDiscount("FLAT15", new BigDecimal("100.00"), LocalDate.now().plusDays(10));
        assertThat(discount).isEqualByComparingTo(new BigDecimal("15.00"));
    }

    @Test
    @DisplayName("calculateDiscount handles EARLY_BIRD discounts based on days until event")
    void testCalculateDiscount_EarlyBird() {
        when(couponRepository.findByCode("EARLYBIRD")).thenReturn(Optional.of(earlyBirdCoupon));

        // 14 days ahead (> 7 days) -> full 20% discount on 100 = 20
        BigDecimal fullDiscount = couponService.calculateDiscount("EARLYBIRD", new BigDecimal("100.00"), LocalDate.now().plusDays(14));
        assertThat(fullDiscount).isEqualByComparingTo(new BigDecimal("20.00"));

        // 3 days ahead (<= 7 days) -> half (10%) discount on 100 = 10
        BigDecimal halfDiscount = couponService.calculateDiscount("EARLYBIRD", new BigDecimal("100.00"), LocalDate.now().plusDays(3));
        assertThat(halfDiscount).isEqualByComparingTo(new BigDecimal("10.00"));
    }

    @Test
    @DisplayName("calculateDiscount caps discount at original amount")
    void testCalculateDiscount_Capped() {
        Coupon hugeCoupon = new Coupon("HUGE50", DiscountType.FIXED, new BigDecimal("150"),
                LocalDate.now().plusDays(30), 10, new BigDecimal("10.00"));
        ReflectionTestUtils.setField(hugeCoupon, "id", 4L);

        when(couponRepository.findByCode("HUGE50")).thenReturn(Optional.of(hugeCoupon));

        BigDecimal discount = couponService.calculateDiscount("HUGE50", new BigDecimal("50.00"), LocalDate.now());
        assertThat(discount).isEqualByComparingTo(new BigDecimal("50.00"));
    }

    @Test
    @DisplayName("incrementUsage increments coupon used count")
    void testIncrementUsage() {
        when(couponRepository.findByCode("SAVE20")).thenReturn(Optional.of(percentageCoupon));

        couponService.incrementUsage("SAVE20");

        assertThat(percentageCoupon.getUsedCount()).isEqualTo(1);
        verify(couponRepository).save(percentageCoupon);
    }

    @Test
    @DisplayName("getAllCoupons returns all coupons mapped to DTO")
    void testGetAllCoupons() {
        when(couponRepository.findAll()).thenReturn(List.of(percentageCoupon, fixedCoupon));

        List<CouponResponseDTO> list = couponService.getAllCoupons();
        assertThat(list).hasSize(2);
    }
}

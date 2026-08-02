package com.kritagya.event_booking_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CouponRequestDTO {

    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotBlank(message = "Discount type is required (PERCENTAGE, FIXED, EARLY_BIRD)")
    private String discountType;

    @NotNull(message = "Discount value is required")
    @Positive(message = "Discount value must be positive")
    private BigDecimal discountValue;

    private LocalDate expiryDate;
    private Integer usageLimit;
    private BigDecimal minBookingAmount;

    public CouponRequestDTO() {
    }

    public CouponRequestDTO(String code, String discountType, BigDecimal discountValue,
                            LocalDate expiryDate, Integer usageLimit, BigDecimal minBookingAmount) {
        this.code = code;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.expiryDate = expiryDate;
        this.usageLimit = usageLimit;
        this.minBookingAmount = minBookingAmount;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Integer getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }

    public BigDecimal getMinBookingAmount() {
        return minBookingAmount;
    }

    public void setMinBookingAmount(BigDecimal minBookingAmount) {
        this.minBookingAmount = minBookingAmount;
    }
}

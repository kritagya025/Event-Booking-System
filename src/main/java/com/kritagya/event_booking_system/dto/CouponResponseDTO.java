package com.kritagya.event_booking_system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CouponResponseDTO {

    private Long id;
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private LocalDate expiryDate;
    private Integer usageLimit;
    private Integer usedCount;
    private BigDecimal minBookingAmount;
    private boolean active;

    public CouponResponseDTO() {
    }

    public CouponResponseDTO(Long id, String code, String discountType, BigDecimal discountValue,
                             LocalDate expiryDate, Integer usageLimit, Integer usedCount,
                             BigDecimal minBookingAmount, boolean active) {
        this.id = id;
        this.code = code;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.expiryDate = expiryDate;
        this.usageLimit = usageLimit;
        this.usedCount = usedCount;
        this.minBookingAmount = minBookingAmount;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public Integer getUsageLimit() { return usageLimit; }
    public void setUsageLimit(Integer usageLimit) { this.usageLimit = usageLimit; }

    public Integer getUsedCount() { return usedCount; }
    public void setUsedCount(Integer usedCount) { this.usedCount = usedCount; }

    public BigDecimal getMinBookingAmount() { return minBookingAmount; }
    public void setMinBookingAmount(BigDecimal minBookingAmount) { this.minBookingAmount = minBookingAmount; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}

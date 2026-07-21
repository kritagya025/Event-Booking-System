package com.kritagya.event_booking_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class VenueRequestDTO {

    @NotBlank(message = "Venue name is required")
    private String name;

    @NotBlank(message = "Venue address is required")
    private String address;

    @NotNull(message = "Venue capacity is required")
    @Positive(message = "Venue capacity must be greater than 0")
    private Integer capacity;

    private String description;

    public VenueRequestDTO() {

    }

    public VenueRequestDTO(String name, String address, Integer capacity, String description) {
        this.name = name;
        this.address = address;
        this.capacity = capacity;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public String getDescription() {
        return description;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

package com.kritagya.event_booking_system.dto;

public class VenueResponseDTO {

    private Long id;
    private String name;
    private String address;
    private Integer capacity;
    private String description;

    public VenueResponseDTO(){

    }

    public VenueResponseDTO(Long id,String name,String address,Integer capacity,String description){
        this.id=id;
        this.name=name;
        this.address=address;
        this.capacity=capacity;
        this.description=description;
    }

    public Long getId(){
        return id;
    }

    public String getName(){
        return name;
    }

    public String getAddress(){
        return address;
    }

    public Integer getCapacity(){
        return capacity;
    }

    public String getDescription(){
        return description;
    }

}

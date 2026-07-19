package com.kritagya.event_booking_system.dto;

public class VenueRequestDTO {

    private String name;
    private String address;
    private Integer capacity;
    private String description;

    public VenueRequestDTO(){

    }

    public VenueRequestDTO(String name,String address,Integer capacity,String description){
        this.name=name;
        this.address=address;
        this.capacity=capacity;
        this.description=description;
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

    public void setName(String name){
        this.name=name;
    }

    public void setAddress(String address){
        this.address=address;
    }

    public void setCapacity(Integer capacity){
        this.capacity=capacity;
    }

    public void setDescription(){
        this.description=description;
    }
}

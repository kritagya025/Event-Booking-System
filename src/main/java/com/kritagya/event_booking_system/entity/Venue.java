package com.kritagya.event_booking_system.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String address;
    private Integer capacity;
    private String description;

    public Venue(){
        
    }

    public Venue(String name,String address,Integer capacity,String description){
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

    public void setName(String name){
        this.name=name;
    }

    public String getAddress(){
        return address;
    }

    public void setAddress(String address){
        this.address=address;
    }

    public Integer getCapacity(){
        return capacity;
    }

    public void setCapacity(Integer capacity){
        this.capacity=capacity;
    }

    public String getDescription(){
        return description;
    }

    public void setDescription(String description){
        this.description=description;
    }
}

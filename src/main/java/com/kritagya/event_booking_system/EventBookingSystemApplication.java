package com.kritagya.event_booking_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EventBookingSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(EventBookingSystemApplication.class, args);
	}

}

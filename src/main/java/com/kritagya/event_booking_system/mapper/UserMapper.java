package com.kritagya.event_booking_system.mapper;

import com.kritagya.event_booking_system.dto.UserRequestDTO;
import com.kritagya.event_booking_system.dto.UserResponseDTO;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.enums.Role;

public class UserMapper {

    public static User toEntity(UserRequestDTO request) {
        return new User(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPassword(),
                request.getPhone(),
                Role.valueOf(request.getRole())
        );
    }

    public static UserResponseDTO toDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name()
        );
    }
}

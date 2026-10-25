package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.UserRequestDTO;
import com.kritagya.event_booking_system.dto.UserResponseDTO;
import com.kritagya.event_booking_system.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Endpoints for user management, profile updates, and role assignments")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated profile", description = "Retrieves user account and profile data for currently logged in user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Profile details retrieved"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<UserResponseDTO> getCurrentUser(
            @AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        UserResponseDTO profile = userService.getCurrentUserProfile(userDetails.getUser());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile", description = "Updates personal details (first name, last name, phone) of current logged in user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<UserResponseDTO> updateCurrentUser(
            @AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails,
            @Valid @RequestBody com.kritagya.event_booking_system.dto.UserProfileUpdateDTO request) {
        UserResponseDTO updatedProfile = userService.updateCurrentUserProfile(userDetails.getUser(), request);
        return ResponseEntity.ok(updatedProfile);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create user (Admin only)", description = "Creates a new user account with designated role. Requires ADMIN role.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User created successfully"),
            @ApiResponse(responseCode = "400", description = "Validation error or email already in use"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO request) {
        UserResponseDTO response = userService.createUser(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all users (Admin only)", description = "Retrieves a list of all registered accounts. Requires ADMIN role.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User list returned"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieves user by ID. Users can view own details; ADMIN can view any user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User details found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - cannot view another user's profile"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserResponseDTO> getUser(
            @Parameter(description = "User ID") @PathVariable Long id,
            @AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        if (!userDetails.getUser().getId().equals(id) && userDetails.getUser().getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not authorized to view this user profile.");
        }
        UserResponseDTO user = userService.getUser(id);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user by ID", description = "Updates details of user. Users can update own profile; ADMIN can update any user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - cannot edit another user's profile"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserResponseDTO> updateUser(
            @Parameter(description = "User ID") @PathVariable Long id,
            @Valid @RequestBody UserRequestDTO request,
            @AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        if (!userDetails.getUser().getId().equals(id) && userDetails.getUser().getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not authorized to update this user profile.");
        }
        UserResponseDTO user = userService.updateUser(id, request);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user role (Admin only)", description = "Changes role of specified user (CUSTOMER, ORGANIZER, ADMIN). Requires ADMIN role.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User role updated successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserResponseDTO> updateUserRole(
            @Parameter(description = "User ID") @PathVariable Long id,
            @Parameter(description = "Role to assign") @RequestParam com.kritagya.event_booking_system.enums.Role role) {
        UserResponseDTO updatedUser = userService.updateUserRole(id, role);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user (Admin only)", description = "Removes a user account. Requires ADMIN role.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "User deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User ID") @PathVariable Long id) {
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

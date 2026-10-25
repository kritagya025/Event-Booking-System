package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.VenueRequestDTO;
import com.kritagya.event_booking_system.dto.VenueResponseDTO;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.exception.VenueNotFoundException;
import com.kritagya.event_booking_system.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VenueServiceTest {

    @Mock
    private VenueRepository venueRepository;

    @InjectMocks
    private VenueService venueService;

    private Venue venue;

    @BeforeEach
    void setUp() {
        venue = new Venue("Grand Arena", "123 Main St, Cityville", 5000, "Prime concert venue");
        ReflectionTestUtils.setField(venue, "id", 10L);
    }

    @Test
    @DisplayName("createVenue persists and returns VenueResponseDTO")
    void testCreateVenue_Success() {
        VenueRequestDTO request = new VenueRequestDTO("Metro Pavilion", "456 Market St", 2500, "Indoor theater");

        when(venueRepository.save(any(Venue.class))).thenAnswer(invocation -> {
            Venue v = invocation.getArgument(0);
            ReflectionTestUtils.setField(v, "id", 20L);
            return v;
        });

        VenueResponseDTO response = venueService.createVenue(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(20L);
        assertThat(response.getName()).isEqualTo("Metro Pavilion");
        assertThat(response.getCapacity()).isEqualTo(2500);
        verify(venueRepository).save(any(Venue.class));
    }

    @Test
    @DisplayName("getAllVenues returns all mapped venues")
    void testGetAllVenues() {
        Venue venue2 = new Venue("Skyline Hall", "789 High Ave", 1200, "Skyline view venue");
        ReflectionTestUtils.setField(venue2, "id", 11L);

        when(venueRepository.findAll()).thenReturn(List.of(venue, venue2));

        List<VenueResponseDTO> list = venueService.getAllVenues();

        assertThat(list).hasSize(2);
        assertThat(list.get(0).getName()).isEqualTo("Grand Arena");
        assertThat(list.get(1).getName()).isEqualTo("Skyline Hall");
    }

    @Test
    @DisplayName("getVenue returns venue if found")
    void testGetVenue_Found() {
        when(venueRepository.findById(10L)).thenReturn(Optional.of(venue));

        VenueResponseDTO response = venueService.getVenue(10L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getName()).isEqualTo("Grand Arena");
    }

    @Test
    @DisplayName("getVenue throws VenueNotFoundException if venue not found")
    void testGetVenue_NotFound() {
        when(venueRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> venueService.getVenue(99L))
                .isInstanceOf(VenueNotFoundException.class);
    }

    @Test
    @DisplayName("updateVenue updates attributes and saves")
    void testUpdateVenue_Success() {
        VenueRequestDTO updateRequest = new VenueRequestDTO("Grand Arena Updated", "123 Main St, Cityville", 6000, "Expanded arena");

        when(venueRepository.findById(10L)).thenReturn(Optional.of(venue));
        when(venueRepository.save(any(Venue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VenueResponseDTO updated = venueService.updateVenue(10L, updateRequest);

        assertThat(updated.getName()).isEqualTo("Grand Arena Updated");
        assertThat(updated.getCapacity()).isEqualTo(6000);
        assertThat(updated.getDescription()).isEqualTo("Expanded arena");
        verify(venueRepository).save(venue);
    }

    @Test
    @DisplayName("deleteVenue removes venue when it exists")
    void testDeleteVenue_Success() {
        when(venueRepository.existsById(10L)).thenReturn(true);

        venueService.deleteVenue(10L);

        verify(venueRepository).deleteById(10L);
    }

    @Test
    @DisplayName("deleteVenue throws VenueNotFoundException when venue does not exist")
    void testDeleteVenue_NotFound() {
        when(venueRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> venueService.deleteVenue(99L))
                .isInstanceOf(VenueNotFoundException.class);

        verify(venueRepository, never()).deleteById(anyLong());
    }
}

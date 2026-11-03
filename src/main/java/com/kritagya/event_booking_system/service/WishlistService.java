package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.entity.Wishlist;
import com.kritagya.event_booking_system.exception.EventNotFoundException;
import com.kritagya.event_booking_system.mapper.EventMapper;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.WishlistRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private static final Logger log = LoggerFactory.getLogger(WishlistService.class);

    private final WishlistRepository wishlistRepository;
    private final EventRepository eventRepository;

    public WishlistService(WishlistRepository wishlistRepository, EventRepository eventRepository) {
        this.wishlistRepository = wishlistRepository;
        this.eventRepository = eventRepository;
    }

    @Transactional
    public void addToWishlist(Long eventId, User user) {
        Event event = eventRepository.findByIdAndDeletedFalse(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        if (wishlistRepository.existsByUserIdAndEventId(user.getId(), eventId)) {
            return; // Already in wishlist
        }

        Wishlist wishlist = new Wishlist(user, event);
        wishlistRepository.save(wishlist);
        log.info("Event {} added to wishlist by user {}", eventId, user.getEmail());
    }

    @Transactional
    public void removeFromWishlist(Long eventId, User user) {
        if (!eventRepository.existsById(eventId)) {
            throw new EventNotFoundException(eventId);
        }
        wishlistRepository.deleteByUserIdAndEventId(user.getId(), eventId);
        log.info("Event {} removed from wishlist by user {}", eventId, user.getEmail());
    }

    @Transactional(readOnly = true)
    public List<EventResponseDTO> getUserWishlist(User user) {
        return wishlistRepository.findByUserId(user.getId())
                .stream()
                .map(Wishlist::getEvent)
                .filter(e -> !e.isDeleted())
                .map(EventMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isEventWishlisted(Long eventId, User user) {
        if (user == null || user.getId() == null) {
            return false;
        }
        return wishlistRepository.existsByUserIdAndEventId(user.getId(), eventId);
    }
}

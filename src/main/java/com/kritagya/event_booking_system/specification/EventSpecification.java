package com.kritagya.event_booking_system.specification;

import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.enums.EventStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class EventSpecification {

    public static Specification<Event> withFilters(String category, LocalDate dateFrom, LocalDate dateTo,
                                                    Long venueId, String city, String keyword,
                                                    BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always exclude soft-deleted events
            predicates.add(criteriaBuilder.isFalse(root.get("deleted")));

            // Only exclude cancelled events
            predicates.add(criteriaBuilder.notEqual(root.get("status"), EventStatus.CANCELLED));

            if (category != null && !category.isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            if (dateFrom != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("eventDate"), dateFrom));
            }

            if (dateTo != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("eventDate"), dateTo));
            }

            if (venueId != null) {
                predicates.add(criteriaBuilder.equal(root.get("venue").get("id"), venueId));
            }

            if (city != null && !city.isBlank()) {
                String cityPattern = "%" + city.toLowerCase() + "%";
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("venue").get("address")), cityPattern));
            }

            if (keyword != null && !keyword.isBlank()) {
                String[] tokens = keyword.trim().toLowerCase().split("\\s+");
                List<Predicate> tokenPredicates = new ArrayList<>();
                for (String token : tokens) {
                    if (!token.isBlank()) {
                        String pattern = "%" + token + "%";
                        Predicate nameLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern);
                        Predicate descLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern);
                        Predicate venueLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("venue").get("name")), pattern);
                        Predicate venueAddrLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("venue").get("address")), pattern);
                        Predicate catLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("category")), pattern);
                        tokenPredicates.add(criteriaBuilder.or(nameLike, descLike, venueLike, venueAddrLike, catLike));
                    }
                }
                if (!tokenPredicates.isEmpty()) {
                    predicates.add(criteriaBuilder.or(tokenPredicates.toArray(new Predicate[0])));
                }
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("ticketPrice"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("ticketPrice"), maxPrice));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}

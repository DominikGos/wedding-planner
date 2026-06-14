package com.planner.wedding.repositories;

import com.planner.wedding.entities.Guest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuestRepository extends JpaRepository<Guest, Long> {

    List<Guest> findByEventId(Long eventId);

    List<Guest> findByEmail(String email);

    Optional<Guest> findByEventEventCodeAndGuestCode(String eventCode, String guestCode);

    List<Guest> findByEventEventCodeAndFirstNameIgnoreCaseAndLastNameIgnoreCase(
            String eventCode,
            String firstName,
            String lastName
    );
}

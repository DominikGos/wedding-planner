package com.planner.wedding.repositories;

import com.planner.wedding.entities.Guest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuestRepository extends JpaRepository<Guest, Long> {

    List<Guest> findByEventId(Long eventId);

    List<Guest> findByEmail(String email);

}
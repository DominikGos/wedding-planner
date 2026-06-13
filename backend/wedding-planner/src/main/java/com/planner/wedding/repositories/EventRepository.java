package com.planner.wedding.repositories;

import com.planner.wedding.entities.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByUserId(Long userId);

    Optional<Event> findByIdAndUserId(Long id, Long userId);
}

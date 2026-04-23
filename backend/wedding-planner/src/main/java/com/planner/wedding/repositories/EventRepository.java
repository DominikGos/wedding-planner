package com.planner.wedding.repositories;

import com.planner.wedding.entities.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
}
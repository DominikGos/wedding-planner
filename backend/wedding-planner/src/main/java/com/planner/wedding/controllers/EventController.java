package com.planner.wedding.controllers;

import com.planner.wedding.entities.Event;
import com.planner.wedding.entities.User;
import com.planner.wedding.services.EventService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // READ ALL
    @GetMapping
    public List<Event> getAllEvents(@AuthenticationPrincipal User user) {
        return eventService.findAll(user);
    }

    // READ ONE
    @GetMapping("/{id}")
    public Event getEvent(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return eventService.findById(id, user);
    }

    // CREATE
    @PostMapping
    public Event createEvent(@RequestBody Event event, @AuthenticationPrincipal User user) {
        return eventService.create(event, user);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Event updateEvent(
            @PathVariable Long id,
            @RequestBody Event event,
            @AuthenticationPrincipal User user
    ) {
        return eventService.update(id, event, user);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id, @AuthenticationPrincipal User user) {
        eventService.delete(id, user);
    }
}

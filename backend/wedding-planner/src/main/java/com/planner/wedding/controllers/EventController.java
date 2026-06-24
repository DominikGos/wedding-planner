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

    @GetMapping
    public List<Event> getAllEvents(@AuthenticationPrincipal User user) {
        return eventService.findAll(user);
    }

    @GetMapping("/{id}")
    public Event getEvent(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return eventService.findById(id, user);
    }

    @PostMapping
    public Event createEvent(@RequestBody Event event, @AuthenticationPrincipal User user) {
        return eventService.create(event, user);
    }

    @PutMapping("/{id}")
    public Event updateEvent(
            @PathVariable Long id,
            @RequestBody Event event,
            @AuthenticationPrincipal User user
    ) {
        return eventService.update(id, event, user);
    }

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id, @AuthenticationPrincipal User user) {
        eventService.delete(id, user);
    }
}

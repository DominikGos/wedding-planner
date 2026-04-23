package com.planner.wedding.controllers;

import com.planner.wedding.entities.Event;
import com.planner.wedding.services.EventService;
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
    public List<Event> getAllEvents() {
        return eventService.findAll();
    }

    // READ ONE
    @GetMapping("/{id}")
    public Event getEvent(@PathVariable Long id) {
        return eventService.findById(id)
                .orElseThrow();
    }

    // CREATE
    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        return eventService.save(event);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Event updateEvent(
            @PathVariable Long id,
            @RequestBody Event event
    ) {
        event.setId(id);
        return eventService.save(event);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id) {
        eventService.delete(id);
    }
}
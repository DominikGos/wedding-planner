package com.planner.wedding.services;

import com.planner.wedding.entities.Event;
import com.planner.wedding.entities.User;
import com.planner.wedding.repositories.EventRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<Event> findAll(User user) {
        return eventRepository.findByUserId(user.getId());
    }

    public Event findById(Long id, User user) {
        return requireOwnedEvent(id, user);
    }

    public Event create(Event event, User user) {
        event.setId(null);
        event.setUser(user);
        return eventRepository.save(event);
    }

    public Event update(Long id, Event changes, User user) {
        Event event = requireOwnedEvent(id, user);
        event.setName(changes.getName());
        event.setEventDate(changes.getEventDate());
        event.setLocation(changes.getLocation());
        event.setStatus(changes.getStatus());
        return eventRepository.save(event);
    }

    public void delete(Long id, User user) {
        eventRepository.delete(requireOwnedEvent(id, user));
    }

    public Event requireOwnedEvent(Long id, User user) {
        return eventRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
    }
}

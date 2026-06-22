package com.planner.wedding.services;

import com.planner.wedding.entities.Event;
import com.planner.wedding.entities.User;
import com.planner.wedding.entities.UserRole;
import com.planner.wedding.repositories.EventRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<Event> findAll(User user) {
        List<Event> events = user.getRole() == UserRole.PLANNER
                ? eventRepository.findAll()
                : eventRepository.findByUserId(user.getId());
        events.stream().filter(this::ensureEventCode).forEach(eventRepository::save);
        return events;
    }

    public Event findById(Long id, User user) {
        return requireOwnedEvent(id, user);
    }

    public Event create(Event event, User user) {
        event.setId(null);
        event.setUser(user);
        event.setEventCode(UUID.randomUUID().toString());
        return eventRepository.save(event);
    }

    public Event update(Long id, Event changes, User user) {
        Event event = requireOwnedEvent(id, user);
        event.setName(changes.getName());
        event.setEventDate(changes.getEventDate());
        event.setLocation(changes.getLocation());
        event.setStatus(changes.getStatus());
        event.setCateringNotes(changes.getCateringNotes());
        event.setCateringMenu(changes.getCateringMenu());
        return eventRepository.save(event);
    }

    public void delete(Long id, User user) {
        eventRepository.delete(requireOwnedEvent(id, user));
    }

    public Event requireOwnedEvent(Long id, User user) {
        Event event = user.getRole() == UserRole.PLANNER
                ? eventRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"))
                : eventRepository.findByIdAndUserId(id, user.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        if (ensureEventCode(event)) {
            return eventRepository.save(event);
        }
        return event;
    }

    private boolean ensureEventCode(Event event) {
        if (event.getEventCode() != null && !event.getEventCode().isBlank()) {
            return false;
        }
        event.setEventCode(UUID.randomUUID().toString());
        return true;
    }
}

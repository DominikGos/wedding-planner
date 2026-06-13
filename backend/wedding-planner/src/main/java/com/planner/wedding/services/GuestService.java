package com.planner.wedding.services;

import com.planner.wedding.entities.Event;
import com.planner.wedding.entities.Guest;
import com.planner.wedding.entities.User;
import com.planner.wedding.repositories.GuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class GuestService {

    private final GuestRepository guestRepository;
    private final EventService eventService;

    @Transactional(readOnly = true)
    public List<Guest> findByEventId(Long eventId, User user) {
        eventService.requireOwnedEvent(eventId, user);
        return guestRepository.findByEventId(eventId);
    }

    @Transactional(readOnly = true)
    public Guest findById(Long eventId, Long guestId, User user) {
        eventService.requireOwnedEvent(eventId, user);
        Guest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guest not found"));
        if (!guest.getEvent().getId().equals(eventId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guest does not belong to this event");
        }
        return guest;
    }

    public Guest create(Long eventId, Guest guest, User user) {
        Event event = eventService.requireOwnedEvent(eventId, user);
        guest.setId(null);
        guest.setEvent(event);
        return guestRepository.save(guest);
    }

    public Guest update(Long eventId, Long guestId, Guest changes, User user) {
        Guest guest = findById(eventId, guestId, user);
        guest.setFirstName(changes.getFirstName());
        guest.setLastName(changes.getLastName());
        guest.setEmail(changes.getEmail());
        guest.setRsvpStatus(changes.getRsvpStatus());
        return guestRepository.save(guest);
    }

    public void delete(Long eventId, Long guestId, User user) {
        Guest guest = findById(eventId, guestId, user);
        guestRepository.delete(guest);
    }
}

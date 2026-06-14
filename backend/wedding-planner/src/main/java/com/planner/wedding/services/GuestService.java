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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class GuestService {

    private final GuestRepository guestRepository;
    private final EventService eventService;

    @Transactional(readOnly = true)
    public List<Guest> findByEventId(Long eventId, User user) {
        eventService.requireOwnedEvent(eventId, user);
        List<Guest> guests = guestRepository.findByEventId(eventId);
        guests.stream().filter(this::ensureGuestCode).forEach(guestRepository::save);
        return guests;
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
        guest.setGuestCode(UUID.randomUUID().toString());
        if (guest.getRsvpStatus() == null || guest.getRsvpStatus().isBlank()) {
            guest.setRsvpStatus("PENDING");
        }
        return guestRepository.save(guest);
    }

    public Guest update(Long eventId, Long guestId, Guest changes, User user) {
        Guest guest = findById(eventId, guestId, user);
        guest.setFirstName(changes.getFirstName());
        guest.setLastName(changes.getLastName());
        guest.setEmail(changes.getEmail());
        guest.setRsvpStatus(changes.getRsvpStatus());
        guest.setTableName(changes.getTableName());
        guest.setAllergies(changes.getAllergies());
        guest.setDeclineReason(changes.getDeclineReason());
        return guestRepository.save(guest);
    }

    public void delete(Long eventId, Long guestId, User user) {
        Guest guest = findById(eventId, guestId, user);
        guestRepository.delete(guest);
    }

    private boolean ensureGuestCode(Guest guest) {
        if (guest.getGuestCode() != null && !guest.getGuestCode().isBlank()) {
            return false;
        }
        guest.setGuestCode(UUID.randomUUID().toString());
        return true;
    }
}

package com.planner.wedding.controllers;

import com.planner.wedding.entities.Guest;
import com.planner.wedding.entities.User;
import com.planner.wedding.services.GuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events/{eventId}/guests")
@RequiredArgsConstructor
public class GuestController {

    private final GuestService guestService;

    @GetMapping
    public ResponseEntity<List<Guest>> getGuests(
            @PathVariable Long eventId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(guestService.findByEventId(eventId, user));
    }

    @GetMapping("/{guestId}")
    public ResponseEntity<Guest> getGuestById(
            @PathVariable Long eventId,
            @PathVariable Long guestId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(guestService.findById(eventId, guestId, user));
    }

    @PostMapping
    public ResponseEntity<Guest> createGuest(
            @PathVariable Long eventId,
            @RequestBody Guest guest,
            @AuthenticationPrincipal User user
    ) {
        Guest created = guestService.create(eventId, guest, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{guestId}")
    public ResponseEntity<Guest> updateGuest(
            @PathVariable Long eventId,
            @PathVariable Long guestId,
            @RequestBody Guest guest,
            @AuthenticationPrincipal User user
    ) {
        Guest updated = guestService.update(eventId, guestId, guest, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{guestId}")
    public ResponseEntity<Void> deleteGuest(
            @PathVariable Long eventId,
            @PathVariable Long guestId,
            @AuthenticationPrincipal User user
    ) {
        guestService.delete(eventId, guestId, user);
        return ResponseEntity.noContent().build();
    }
}

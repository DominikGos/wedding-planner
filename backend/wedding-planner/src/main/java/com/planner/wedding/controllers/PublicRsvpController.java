package com.planner.wedding.controllers;

import com.planner.wedding.dto.PublicRsvpResponse;
import com.planner.wedding.dto.FindRsvpRequest;
import com.planner.wedding.dto.UpdateRsvpRequest;
import com.planner.wedding.services.PublicRsvpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/rsvp")
@RequiredArgsConstructor
public class PublicRsvpController {

    private final PublicRsvpService publicRsvpService;

    @PostMapping("/find")
    public ResponseEntity<PublicRsvpResponse> findInvitation(@RequestBody FindRsvpRequest request) {
        return ResponseEntity.ok(publicRsvpService.findInvitation(
                request.eventCode(),
                request.firstName(),
                request.lastName()
        ));
    }

    @GetMapping("/{eventCode}/{guestCode}")
    public ResponseEntity<PublicRsvpResponse> getInvitation(
            @PathVariable String eventCode,
            @PathVariable String guestCode
    ) {
        return ResponseEntity.ok(publicRsvpService.getInvitation(eventCode, guestCode));
    }

    @PatchMapping("/{eventCode}/{guestCode}")
    public ResponseEntity<PublicRsvpResponse> updateStatus(
            @PathVariable String eventCode,
            @PathVariable String guestCode,
            @RequestBody UpdateRsvpRequest request
    ) {
        return ResponseEntity.ok(publicRsvpService.updateStatus(
                eventCode,
                guestCode,
                request.rsvpStatus(),
                request.allergies(),
                request.declineReason()
        ));
    }
}

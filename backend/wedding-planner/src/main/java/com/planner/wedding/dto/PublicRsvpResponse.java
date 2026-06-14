package com.planner.wedding.dto;

import java.time.LocalDateTime;

public record PublicRsvpResponse(
        String eventName,
        LocalDateTime eventDate,
        String eventLocation,
        String guestName,
        String rsvpStatus,
        String allergies,
        String declineReason,
        String eventCode,
        String guestCode
) {
}

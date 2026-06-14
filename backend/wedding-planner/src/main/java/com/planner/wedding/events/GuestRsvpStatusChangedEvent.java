package com.planner.wedding.events;

import com.planner.wedding.entities.Guest;

public record GuestRsvpStatusChangedEvent(Guest guest, String newStatus) {
}

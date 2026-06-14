package com.planner.wedding.services;

import com.planner.wedding.dto.PublicRsvpResponse;
import com.planner.wedding.entities.Guest;
import com.planner.wedding.events.GuestRsvpStatusChangedEvent;
import com.planner.wedding.repositories.GuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;
import java.util.Set;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PublicRsvpService {

    private static final Set<String> ALLOWED_STATUSES = Set.of("PENDING", "CONFIRMED", "DECLINED");

    private final GuestRepository guestRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public PublicRsvpResponse getInvitation(String eventCode, String guestCode) {
        return toResponse(requireGuest(eventCode, guestCode));
    }

    public PublicRsvpResponse findInvitation(String eventCode, String firstName, String lastName) {
        if (eventCode == null || firstName == null || lastName == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Zaproszenie nie istnieje lub dane są nieprawidłowe");
        }

        List<Guest> guests = guestRepository.findByEventEventCodeAndFirstNameIgnoreCaseAndLastNameIgnoreCase(
                eventCode.trim(),
                firstName.trim(),
                lastName.trim()
        );
        if (guests.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Zaproszenie nie istnieje lub dane są nieprawidłowe");
        }
        if (guests.size() > 1) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Znaleziono więcej niż jednego gościa o tych danych. Skontaktuj się z parą młodą"
            );
        }
        Guest guest = guests.get(0);
        if (guest.getGuestCode() == null || guest.getGuestCode().isBlank()) {
            guest.setGuestCode(UUID.randomUUID().toString());
            guestRepository.save(guest);
        }
        return toResponse(guest);
    }

    public PublicRsvpResponse updateStatus(
            String eventCode,
            String guestCode,
            String status,
            String allergies,
            String declineReason
    ) {
        if (status == null || !ALLOWED_STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid RSVP status");
        }

        Guest guest = requireGuest(eventCode, guestCode);
        String previousStatus = guest.getRsvpStatus();
        guest.setRsvpStatus(status);
        guest.setAllergies(allergies);
        guest.setDeclineReason("DECLINED".equals(status) ? declineReason : null);
        Guest updatedGuest = guestRepository.save(guest);

        if (!Objects.equals(previousStatus, status)) {
            eventPublisher.publishEvent(new GuestRsvpStatusChangedEvent(updatedGuest, status));
        }
        return toResponse(updatedGuest);
    }

    private Guest requireGuest(String eventCode, String guestCode) {
        return guestRepository.findByEventEventCodeAndGuestCode(eventCode, guestCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));
    }

    private PublicRsvpResponse toResponse(Guest guest) {
        String guestName = String.join(" ",
                guest.getFirstName() == null ? "" : guest.getFirstName(),
                guest.getLastName() == null ? "" : guest.getLastName()
        ).trim();
        return new PublicRsvpResponse(
                guest.getEvent().getName(),
                guest.getEvent().getEventDate(),
                guest.getEvent().getLocation(),
                guestName,
                guest.getRsvpStatus(),
                guest.getAllergies(),
                guest.getDeclineReason(),
                guest.getEvent().getEventCode(),
                guest.getGuestCode()
        );
    }
}

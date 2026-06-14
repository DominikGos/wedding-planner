package com.planner.wedding.services;

import com.planner.wedding.dto.PublicRsvpResponse;
import com.planner.wedding.entities.Event;
import com.planner.wedding.entities.Guest;
import com.planner.wedding.events.GuestRsvpStatusChangedEvent;
import com.planner.wedding.repositories.GuestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicRsvpServiceTest {

    @Mock
    private GuestRepository guestRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Test
    void returnsInvitationForValidCodes() {
        Guest guest = guest("PENDING");
        when(guestRepository.findByEventEventCodeAndGuestCode("event-code", "guest-code"))
                .thenReturn(Optional.of(guest));

        PublicRsvpResponse response = service().getInvitation("event-code", "guest-code");

        assertEquals("Wedding", response.eventName());
        assertEquals("Anna Kowalska", response.guestName());
        assertEquals("PENDING", response.rsvpStatus());
        assertEquals("event-code", response.eventCode());
        assertEquals("guest-code", response.guestCode());
    }

    @Test
    void findsInvitationIgnoringCaseAndTrimmingNames() {
        Guest guest = guest("PENDING");
        when(guestRepository.findByEventEventCodeAndFirstNameIgnoreCaseAndLastNameIgnoreCase(
                "event-code", "anna", "KOWALSKA"
        )).thenReturn(List.of(guest));

        PublicRsvpResponse response = service().findInvitation(" event-code ", " anna ", " KOWALSKA ");

        assertEquals("Anna Kowalska", response.guestName());
        assertEquals("guest-code", response.guestCode());
    }

    @Test
    void returnsNotFoundWhenInvitationSearchHasNoResult() {
        when(guestRepository.findByEventEventCodeAndFirstNameIgnoreCaseAndLastNameIgnoreCase(
                "event-code", "Anna", "Wrong"
        )).thenReturn(List.of());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service().findInvitation("event-code", "Anna", "Wrong")
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void returnsConflictWhenInvitationSearchHasDuplicates() {
        when(guestRepository.findByEventEventCodeAndFirstNameIgnoreCaseAndLastNameIgnoreCase(
                "event-code", "Anna", "Kowalska"
        )).thenReturn(List.of(guest("PENDING"), guest("CONFIRMED")));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service().findInvitation("event-code", "Anna", "Kowalska")
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void generatesGuestCodeWhenOlderInvitationIsFound() {
        Guest guest = guest("PENDING");
        guest.setGuestCode(null);
        when(guestRepository.findByEventEventCodeAndFirstNameIgnoreCaseAndLastNameIgnoreCase(
                "event-code", "Anna", "Kowalska"
        )).thenReturn(List.of(guest));
        when(guestRepository.save(guest)).thenReturn(guest);

        PublicRsvpResponse response = service().findInvitation("event-code", "Anna", "Kowalska");

        assertNotNull(response.guestCode());
        verify(guestRepository).save(guest);
    }

    @Test
    void returnsNotFoundForInvalidCodes() {
        when(guestRepository.findByEventEventCodeAndGuestCode("bad", "codes")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service().getInvitation("bad", "codes")
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void updatesOnlyStatusAndPublishesEvent() {
        Guest guest = guest("PENDING");
        when(guestRepository.findByEventEventCodeAndGuestCode("event-code", "guest-code"))
                .thenReturn(Optional.of(guest));
        when(guestRepository.save(guest)).thenReturn(guest);

        guest.setTableName("Stół 3");
        PublicRsvpResponse response = service().updateStatus(
                "event-code", "guest-code", "CONFIRMED", "orzechy", "nie dam rady"
        );

        assertEquals("CONFIRMED", response.rsvpStatus());
        assertEquals("orzechy", response.allergies());
        assertNull(response.declineReason());
        assertEquals("Stół 3", guest.getTableName());
        assertEquals("Anna", guest.getFirstName());
        ArgumentCaptor<GuestRsvpStatusChangedEvent> captor = ArgumentCaptor.forClass(GuestRsvpStatusChangedEvent.class);
        verify(eventPublisher).publishEvent(captor.capture());
        assertSame(guest, captor.getValue().guest());
    }

    @Test
    void doesNotPublishEventWhenStatusIsUnchanged() {
        Guest guest = guest("CONFIRMED");
        when(guestRepository.findByEventEventCodeAndGuestCode("event-code", "guest-code"))
                .thenReturn(Optional.of(guest));
        when(guestRepository.save(guest)).thenReturn(guest);

        service().updateStatus("event-code", "guest-code", "CONFIRMED", "gluten", null);

        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void rejectsInvalidStatus() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service().updateStatus("event-code", "guest-code", "REJECTED", null, null)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verifyNoInteractions(guestRepository, eventPublisher);
    }

    @Test
    void savesDeclineReasonOnlyForDeclinedStatus() {
        Guest guest = guest("PENDING");
        when(guestRepository.findByEventEventCodeAndGuestCode("event-code", "guest-code"))
                .thenReturn(Optional.of(guest));
        when(guestRepository.save(guest)).thenReturn(guest);

        PublicRsvpResponse response = service().updateStatus(
                "event-code", "guest-code", "DECLINED", null, "wyjazd służbowy"
        );

        assertEquals("wyjazd służbowy", response.declineReason());
    }

    private PublicRsvpService service() {
        return new PublicRsvpService(guestRepository, eventPublisher);
    }

    private Guest guest(String status) {
        Event event = Event.builder()
                .name("Wedding")
                .eventDate(LocalDateTime.of(2026, 6, 25, 0, 0))
                .location("Venue")
                .eventCode("event-code")
                .build();
        return Guest.builder()
                .firstName("Anna")
                .lastName("Kowalska")
                .rsvpStatus(status)
                .guestCode("guest-code")
                .event(event)
                .build();
    }
}

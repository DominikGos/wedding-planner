package com.planner.wedding.services;

import com.planner.wedding.entities.Event;
import com.planner.wedding.entities.Guest;
import com.planner.wedding.entities.User;
import com.planner.wedding.repositories.GuestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GuestServiceTest {

    @Mock
    private GuestRepository guestRepository;

    @Mock
    private EventService eventService;

    @InjectMocks
    private GuestService guestService;

    @Test
    void findByEventIdReturnsGuestsWhenEventOwnedByUser() {
        User user = User.builder().id(1L).build();
        Event event = Event.builder().id(10L).user(user).build();
        Guest guest = Guest.builder().id(100L).firstName("John").lastName("Doe").event(event).build();

        when(eventService.requireOwnedEvent(10L, user)).thenReturn(event);
        when(guestRepository.findByEventId(10L)).thenReturn(List.of(guest));

        List<Guest> result = guestService.findByEventId(10L, user);

        assertEquals(1, result.size());
        assertSame(guest, result.get(0));
        verify(eventService).requireOwnedEvent(10L, user);
        verify(guestRepository).findByEventId(10L);
    }

    @Test
    void findByIdReturnsGuestWhenBelongsToEvent() {
        User user = User.builder().id(1L).build();
        Event event = Event.builder().id(10L).user(user).build();
        Guest guest = Guest.builder().id(100L).event(event).build();

        when(eventService.requireOwnedEvent(10L, user)).thenReturn(event);
        when(guestRepository.findById(100L)).thenReturn(Optional.of(guest));

        Guest result = guestService.findById(10L, 100L, user);

        assertSame(guest, result);
    }

    @Test
    void findByIdThrowsBadRequestWhenGuestBelongsToDifferentEvent() {
        User user = User.builder().id(1L).build();
        Event event10 = Event.builder().id(10L).user(user).build();
        Event event20 = Event.builder().id(20L).user(user).build();
        Guest guest = Guest.builder().id(100L).event(event20).build();

        when(eventService.requireOwnedEvent(10L, user)).thenReturn(event10);
        when(guestRepository.findById(100L)).thenReturn(Optional.of(guest));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            guestService.findById(10L, 100L, user);
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("belong to this event"));
    }

    @Test
    void createAssociatesEventAndSavesGuest() {
        User user = User.builder().id(1L).build();
        Event event = Event.builder().id(10L).user(user).build();
        Guest guest = Guest.builder().firstName("John").lastName("Doe").build();

        when(eventService.requireOwnedEvent(10L, user)).thenReturn(event);
        when(guestRepository.save(any(Guest.class))).thenAnswer(inv -> inv.getArgument(0));

        Guest result = guestService.create(10L, guest, user);

        assertSame(event, result.getEvent());
        assertEquals("John", result.getFirstName());
        assertNotNull(result.getGuestCode());
        assertEquals("PENDING", result.getRsvpStatus());
        verify(guestRepository).save(guest);
    }

    @Test
    void updateModifiesFieldsAndSaves() {
        User user = User.builder().id(1L).build();
        Event event = Event.builder().id(10L).user(user).build();
        Guest guest = Guest.builder().id(100L).firstName("OldFirst").lastName("OldLast").event(event).build();
        Guest changes = Guest.builder()
                .firstName("NewFirst")
                .lastName("NewLast")
                .email("new@example.com")
                .rsvpStatus("CONFIRMED")
                .tableName("Stół 3")
                .allergies("orzechy")
                .declineReason("wyjazd")
                .build();

        when(eventService.requireOwnedEvent(10L, user)).thenReturn(event);
        when(guestRepository.findById(100L)).thenReturn(Optional.of(guest));
        when(guestRepository.save(any(Guest.class))).thenAnswer(inv -> inv.getArgument(0));

        Guest result = guestService.update(10L, 100L, changes, user);

        assertEquals("NewFirst", result.getFirstName());
        assertEquals("NewLast", result.getLastName());
        assertEquals("new@example.com", result.getEmail());
        assertEquals("CONFIRMED", result.getRsvpStatus());
        assertEquals("Stół 3", result.getTableName());
        assertEquals("orzechy", result.getAllergies());
        assertEquals("wyjazd", result.getDeclineReason());
    }

    @Test
    void deleteRemovesGuestFromRepository() {
        User user = User.builder().id(1L).build();
        Event event = Event.builder().id(10L).user(user).build();
        Guest guest = Guest.builder().id(100L).event(event).build();

        when(eventService.requireOwnedEvent(10L, user)).thenReturn(event);
        when(guestRepository.findById(100L)).thenReturn(Optional.of(guest));

        guestService.delete(10L, 100L, user);

        verify(guestRepository).delete(guest);
    }
}

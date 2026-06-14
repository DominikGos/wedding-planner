package com.planner.wedding.services;

import com.planner.wedding.entities.Event;
import com.planner.wedding.entities.User;
import com.planner.wedding.repositories.EventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Test
    void returnsOnlyEventsOwnedByUser() {
        User user = User.builder().id(7L).build();
        Event event = Event.builder().id(1L).user(user).build();
        when(eventRepository.findByUserId(7L)).thenReturn(List.of(event));

        List<Event> events = new EventService(eventRepository).findAll(user);

        assertSame(event, events.get(0));
        verify(eventRepository).findByUserId(7L);
    }

    @Test
    void updatePreservesOwner() {
        User user = User.builder().id(7L).build();
        Event event = Event.builder().id(1L).user(user).name("Old").build();
        Event changes = Event.builder().name("New").user(User.builder().id(8L).build()).build();
        when(eventRepository.findByIdAndUserId(1L, 7L)).thenReturn(Optional.of(event));
        when(eventRepository.save(event)).thenReturn(event);

        Event updated = new EventService(eventRepository).update(1L, changes, user);

        assertSame(user, updated.getUser());
        verify(eventRepository).findByIdAndUserId(1L, 7L);
    }

    @Test
    void createGeneratesEventCode() {
        User user = User.builder().id(7L).build();
        Event event = Event.builder().name("Wedding").build();
        when(eventRepository.save(event)).thenReturn(event);

        Event created = new EventService(eventRepository).create(event, user);

        assertNotNull(created.getEventCode());
        assertSame(user, created.getUser());
    }
}

package com.planner.wedding.services;

import com.planner.wedding.entities.Event;
import com.planner.wedding.entities.Guest;
import com.planner.wedding.entities.Notification;
import com.planner.wedding.entities.User;
import com.planner.wedding.events.GuestRsvpStatusChangedEvent;
import com.planner.wedding.repositories.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class GuestNotificationListenerTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Test
    void savesReadableNotificationForEventOwner() {
        User owner = User.builder().id(1L).build();
        Event event = Event.builder().user(owner).build();
        Guest guest = Guest.builder().firstName("Anna").lastName("Kowalska").event(event).build();
        GuestNotificationListener listener = new GuestNotificationListener(notificationRepository);

        listener.onGuestRsvpStatusChanged(new GuestRsvpStatusChangedEvent(guest, "CONFIRMED"));

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification notification = captor.getValue();
        assertSame(owner, notification.getUser());
        assertEquals("Anna Kowalska potwierdził(a) obecność.", notification.getMessage());
        assertFalse(notification.getIsRead());
        assertNotNull(notification.getCreatedAt());
    }

    @Test
    void includesDeclineReasonWhenProvided() {
        User owner = User.builder().id(1L).build();
        Event event = Event.builder().user(owner).build();
        Guest guest = Guest.builder()
                .firstName("Anna")
                .lastName("Kowalska")
                .declineReason("wyjazd służbowy")
                .event(event)
                .build();

        new GuestNotificationListener(notificationRepository)
                .onGuestRsvpStatusChanged(new GuestRsvpStatusChangedEvent(guest, "DECLINED"));

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertEquals(
                "Anna Kowalska odmówił(a) udziału. Powód: wyjazd służbowy.",
                captor.getValue().getMessage()
        );
    }
}

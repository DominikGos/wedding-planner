package com.planner.wedding.events;

import com.planner.wedding.entities.*;
import com.planner.wedding.repositories.NotificationRepository;
import com.planner.wedding.services.GuestNotificationListener;
import com.planner.wedding.services.TaskNotificationListener;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.verify;

@ExtendWith(SpringExtension.class)
@Import({GuestNotificationListener.class, TaskNotificationListener.class})
class EventObserverPatternTest {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @MockitoBean
    private NotificationRepository notificationRepository;

    @Test
    void shouldTriggerGuestObserverOnEventPublish() {
        // Arrange
        User user = User.builder().id(1L).email("user@example.com").build();
        Event weddingEvent = Event.builder().id(10L).user(user).build();
        Guest guest = Guest.builder()
                .firstName("Anna")
                .lastName("Kowalska")
                .event(weddingEvent)
                .build();

        GuestRsvpStatusChangedEvent event = new GuestRsvpStatusChangedEvent(guest, "CONFIRMED");

        // Act
        eventPublisher.publishEvent(event);

        // Assert
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        
        Notification notification = captor.getValue();
        assertEquals(user, notification.getUser());
        assertEquals("Anna Kowalska potwierdził(a) obecność.", notification.getMessage());
        assertFalse(notification.getIsRead());
    }

    @Test
    void shouldTriggerTaskObserverOnEventPublish() {
        // Arrange
        User user = User.builder().id(1L).email("user@example.com").build();
        Event weddingEvent = Event.builder().id(10L).user(user).build();
        Task task = Task.builder()
                .id(20L)
                .name("Book Photographer")
                .event(weddingEvent)
                .build();

        TaskStatusChangedEvent event = new TaskStatusChangedEvent(task, "PENDING", "COMPLETED");

        // Act
        eventPublisher.publishEvent(event);

        // Assert
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification notification = captor.getValue();
        assertEquals(user, notification.getUser());
        assertEquals("Zmieniono status zadania \"Book Photographer\": Do zrobienia -> Zrobione", notification.getMessage());
        assertFalse(notification.getIsRead());
    }
}

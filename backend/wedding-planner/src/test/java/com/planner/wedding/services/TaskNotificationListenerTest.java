package com.planner.wedding.services;

import com.planner.wedding.entities.Event;
import com.planner.wedding.entities.Notification;
import com.planner.wedding.entities.Task;
import com.planner.wedding.entities.User;
import com.planner.wedding.events.TaskStatusChangedEvent;
import com.planner.wedding.repositories.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class TaskNotificationListenerTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Test
    void savesNotificationForEventOwner() {
        User owner = User.builder().id(1L).build();
        Event event = Event.builder().user(owner).build();
        Task task = Task.builder().name("Wybór menu").event(event).build();
        TaskNotificationListener listener = new TaskNotificationListener(notificationRepository);

        listener.onTaskStatusChanged(new TaskStatusChangedEvent(task, "PENDING", "COMPLETED"));

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification notification = captor.getValue();
        assertSame(owner, notification.getUser());
        assertTrue(notification.getMessage().contains("Wybór menu"));
        assertTrue(notification.getMessage().contains("PENDING"));
        assertTrue(notification.getMessage().contains("COMPLETED"));
        assertEquals(false, notification.getIsRead());
    }
}

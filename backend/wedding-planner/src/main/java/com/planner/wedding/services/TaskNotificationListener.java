package com.planner.wedding.services;

import com.planner.wedding.entities.Notification;
import com.planner.wedding.events.TaskStatusChangedEvent;
import com.planner.wedding.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class TaskNotificationListener {

    private final NotificationRepository notificationRepository;

    @EventListener
    public void onTaskStatusChanged(TaskStatusChangedEvent event) {
        Notification notification = Notification.builder()
                .user(event.task().getEvent().getUser())
                .message("Status zadania \"" + event.task().getName() + "\" zmieniono z "
                        + event.previousStatus() + " na " + event.newStatus())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }
}

package com.planner.wedding.services;

import com.planner.wedding.entities.Notification;
import com.planner.wedding.entities.User;
import com.planner.wedding.repositories.NotificationRepository;
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
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void getUserNotificationsReturnsSortedNotifications() {
        User user = User.builder().id(1L).build();
        Notification n = Notification.builder().id(10L).user(user).message("Test").build();

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(n));

        List<Notification> result = notificationService.getUserNotifications(user);

        assertEquals(1, result.size());
        assertSame(n, result.get(0));
        verify(notificationRepository).findByUserIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void markAsReadSavesWithIsReadTrueWhenNotificationOwnedByUser() {
        User user = User.builder().id(1L).build();
        Notification n = Notification.builder().id(10L).user(user).isRead(false).build();

        when(notificationRepository.findById(10L)).thenReturn(Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        Notification result = notificationService.markAsRead(10L, user);

        assertTrue(result.getIsRead());
        verify(notificationRepository).save(n);
    }

    @Test
    void markAsReadThrowsForbiddenWhenNotificationOwnedByDifferentUser() {
        User user1 = User.builder().id(1L).build();
        User user2 = User.builder().id(2L).build();
        Notification n = Notification.builder().id(10L).user(user2).isRead(false).build();

        when(notificationRepository.findById(10L)).thenReturn(Optional.of(n));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            notificationService.markAsRead(10L, user1);
        });

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(notificationRepository, never()).save(any());
    }
}

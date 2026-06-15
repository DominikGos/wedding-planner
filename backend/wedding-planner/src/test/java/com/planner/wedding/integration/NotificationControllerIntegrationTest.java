package com.planner.wedding.integration;

import com.planner.wedding.entities.Notification;
import com.planner.wedding.services.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class NotificationControllerIntegrationTest extends BaseIntegrationTest {

    @MockitoBean
    private NotificationService notificationService;

    @Test
    void getNotificationsReturnsList() {
        var notification = Notification.builder().id(1L).message("Task completed").isRead(false).createdAt(LocalDateTime.now()).build();
        when(notificationService.getUserNotifications(any())).thenReturn(List.of(notification));

        webTestClient.get()
                .uri("/api/notifications")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].id").isEqualTo(1)
                .jsonPath("$[0].message").isEqualTo("Task completed");
    }

    @Test
    void markAsReadReturnsNotification() {
        var notification = Notification.builder().id(1L).message("Task completed").isRead(true).build();
        when(notificationService.markAsRead(eq(1L), any())).thenReturn(notification);

        webTestClient.patch()
                .uri("/api/notifications/1/read")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(1)
                .jsonPath("$.isRead").isEqualTo(true);
    }
}

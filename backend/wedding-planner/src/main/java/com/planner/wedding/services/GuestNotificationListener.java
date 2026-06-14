package com.planner.wedding.services;

import com.planner.wedding.entities.Guest;
import com.planner.wedding.entities.Notification;
import com.planner.wedding.events.GuestRsvpStatusChangedEvent;
import com.planner.wedding.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class GuestNotificationListener {

    private final NotificationRepository notificationRepository;

    @EventListener
    public void onGuestRsvpStatusChanged(GuestRsvpStatusChangedEvent event) {
        Guest guest = event.guest();
        Notification notification = Notification.builder()
                .user(guest.getEvent().getUser())
                .message(messageFor(guest, event.newStatus()))
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    private String messageFor(Guest guest, String status) {
        String name = String.join(" ",
                guest.getFirstName() == null ? "" : guest.getFirstName(),
                guest.getLastName() == null ? "" : guest.getLastName()
        ).trim();
        return switch (status) {
            case "CONFIRMED" -> name + " potwierdził(a) obecność.";
            case "DECLINED" -> guest.getDeclineReason() == null || guest.getDeclineReason().isBlank()
                    ? name + " odmówił(a) udziału."
                    : name + " odmówił(a) udziału. Powód: " + guest.getDeclineReason() + ".";
            default -> name + " zmienił(a) odpowiedź na: oczekuje na decyzję.";
        };
    }
}

package com.planner.wedding.events;

import com.planner.wedding.entities.Task;

public record TaskStatusChangedEvent(Task task, String previousStatus, String newStatus) {
}

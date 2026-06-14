package com.planner.wedding.factory;

import com.planner.wedding.dto.CreateTaskDTO;
import com.planner.wedding.entities.Task;
import com.planner.wedding.entities.TaskType;
import java.util.HashMap;
import java.util.Map;

/**
 * Concrete Factory - tworzy Entertainment Tasks
 * Factory Pattern Implementation
 */
public class EntertainmentTaskFactory extends TaskFactory {

    @Override
    public Task createFromDTO(CreateTaskDTO dto) {
        validateDTO(dto);

        return Task.builder()
                .type(TaskType.ENTERTAINMENT)
                .name(dto.getName())
                .description(dto.getDescription())
                .dueDate(dto.getDueDate())
                .status("PENDING")
                .priority(dto.getPriority() != null ? dto.getPriority() : 0)
                .performerName(dto.getPerformerName())
                .totalPrice(dto.getTotalPrice())
                .duration(dto.getDuration())
                .build();
    }

    @Override
    public Map<String, Object> convertToDTO(Task task) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", task.getId());
        dto.put("eventId", task.getEvent() != null ? task.getEvent().getId() : null);
        dto.put("vendorId", task.getVendor() != null ? task.getVendor().getId() : null);
        dto.put("type", task.getType());
        dto.put("name", task.getName());
        dto.put("description", task.getDescription());
        dto.put("dueDate", task.getDueDate());
        dto.put("status", task.getStatus());
        dto.put("priority", task.getPriority());
        dto.put("performerName", task.getPerformerName());
        dto.put("totalPrice", task.getTotalPrice());
        dto.put("duration", task.getDuration());
        return dto;
    }

    @Override
    public void validateDTO(CreateTaskDTO dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("Task name cannot be empty");
        }
        if (dto.getTotalPrice() != null && dto.getTotalPrice().signum() < 0) {
            throw new IllegalArgumentException("Entertainment: totalPrice cannot be negative");
        }
        if (dto.getDuration() != null && dto.getDuration() < 0) {
            throw new IllegalArgumentException("Entertainment: duration cannot be negative");
        }
    }
}

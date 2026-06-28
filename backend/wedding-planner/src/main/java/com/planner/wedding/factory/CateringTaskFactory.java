package com.planner.wedding.factory;

import com.planner.wedding.dto.CreateTaskDTO;
import com.planner.wedding.entities.Task;
import com.planner.wedding.entities.TaskType;
import java.util.HashMap;
import java.util.Map;

/**
 * Concrete Factory - tworzy Catering Tasks
 * Factory Pattern Implementation
 */
public class CateringTaskFactory extends TaskFactory {

    @Override
    public Task createFromDTO(CreateTaskDTO dto) {
        validateDTO(dto);

        return Task.builder()
                .type(TaskType.CATERING)
                .name(dto.getName())
                .description(dto.getDescription())
                .dueDate(dto.getDueDate())
                .status("PENDING")
                .priority(dto.getPriority() != null ? dto.getPriority() : 0)
                .paymentMethod(dto.getPaymentMethod())
                .pricePerGuest(dto.getPricePerGuest())
                .numberOfGuests(dto.getNumberOfGuests())
                .mealType(dto.getMealType())
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
        dto.put("paymentMethod", task.getPaymentMethod());
        dto.put("pricePerGuest", task.getPricePerGuest());
        dto.put("numberOfGuests", task.getNumberOfGuests());
        dto.put("mealType", task.getMealType());
        return dto;
    }

    @Override
    public void validateDTO(CreateTaskDTO dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("Task name cannot be empty");
        }
        if (dto.getPricePerGuest() != null && dto.getPricePerGuest().signum() < 0) {
            throw new IllegalArgumentException("Catering: pricePerGuest cannot be negative");
        }
        if (dto.getNumberOfGuests() != null && dto.getNumberOfGuests() < 0) {
            throw new IllegalArgumentException("Catering: numberOfGuests cannot be negative");
        }
    }
}

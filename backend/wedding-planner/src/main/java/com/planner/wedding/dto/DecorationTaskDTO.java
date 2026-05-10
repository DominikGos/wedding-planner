package com.planner.wedding.dto;

import com.planner.wedding.entities.TaskType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class DecorationTaskDTO {

    private Long id;
    private Long eventId;
    private Long vendorId;
    private TaskType type;
    private String name;
    private String description;
    private LocalDateTime dueDate;
    private String status;
    private Integer priority;
    
    private String theme;
    private BigDecimal totalPrice;
    private String performerName;

    public DecorationTaskDTO(Long id, Long eventId, Long vendorId, TaskType type, String name,
                            String description, LocalDateTime dueDate, String status, Integer priority,
                            String theme, BigDecimal totalPrice, String performerName) {
        this.id = id;
        this.eventId = eventId;
        this.vendorId = vendorId;
        this.type = type;
        this.name = name;
        this.description = description;
        this.dueDate = dueDate;
        this.status = status;
        this.priority = priority;
        this.theme = theme;
        this.totalPrice = totalPrice;
        this.performerName = performerName;
    }
}

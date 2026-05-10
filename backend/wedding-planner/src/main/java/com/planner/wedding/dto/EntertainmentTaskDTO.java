package com.planner.wedding.dto;

import com.planner.wedding.entities.TaskType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class EntertainmentTaskDTO {

    private Long id;
    private Long eventId;
    private Long vendorId;
    private TaskType type;
    private String name;
    private String description;
    private LocalDateTime dueDate;
    private String status;
    private Integer priority;
    
    private String performerName;
    private Integer duration; // w minutach
    private BigDecimal totalPrice;

    public EntertainmentTaskDTO(Long id, Long eventId, Long vendorId, TaskType type, String name,
                               String description, LocalDateTime dueDate, String status, Integer priority,
                               String performerName, Integer duration, BigDecimal totalPrice) {
        this.id = id;
        this.eventId = eventId;
        this.vendorId = vendorId;
        this.type = type;
        this.name = name;
        this.description = description;
        this.dueDate = dueDate;
        this.status = status;
        this.priority = priority;
        this.performerName = performerName;
        this.duration = duration;
        this.totalPrice = totalPrice;
    }
}

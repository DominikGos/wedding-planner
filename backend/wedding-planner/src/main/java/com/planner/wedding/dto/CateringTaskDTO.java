package com.planner.wedding.dto;

import com.planner.wedding.entities.TaskType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class CateringTaskDTO {

    private Long id;
    private Long eventId;
    private Long vendorId;
    private TaskType type;
    private String name;
    private String description;
    private LocalDateTime dueDate;
    private String status;
    private Integer priority;
    
    private BigDecimal pricePerGuest;
    private Integer numberOfGuests;
    private String mealType;

    public CateringTaskDTO(Long id, Long eventId, Long vendorId, TaskType type, String name,
                          String description, LocalDateTime dueDate, String status, Integer priority,
                          BigDecimal pricePerGuest, Integer numberOfGuests, String mealType) {
        this.id = id;
        this.eventId = eventId;
        this.vendorId = vendorId;
        this.type = type;
        this.name = name;
        this.description = description;
        this.dueDate = dueDate;
        this.status = status;
        this.priority = priority;
        this.pricePerGuest = pricePerGuest;
        this.numberOfGuests = numberOfGuests;
        this.mealType = mealType;
    }

    public BigDecimal getTotalPrice() {
        if (pricePerGuest != null && numberOfGuests != null) {
            return pricePerGuest.multiply(BigDecimal.valueOf(numberOfGuests));
        }
        return BigDecimal.ZERO;
    }
}

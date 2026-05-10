package com.planner.wedding.dto;

import com.planner.wedding.entities.TaskType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTaskDTO {

    private TaskType type;
    private String name;
    private String description;
    private LocalDateTime dueDate;
    private Integer priority;

    // Catering fields
    private BigDecimal pricePerGuest;
    private Integer numberOfGuests;
    private String mealType;

    // Decoration fields
    private String theme;

    // Entertainment fields
    private String performerName;
    private Integer duration;

    // Generic price (for Decoration/Entertainment)
    private BigDecimal totalPrice;
    
    // Optional vendor assignment
    private Long vendorId;
}

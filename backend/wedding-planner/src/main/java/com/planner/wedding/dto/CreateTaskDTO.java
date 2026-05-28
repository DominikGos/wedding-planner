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

    // Catering
    private BigDecimal pricePerGuest;
    private Integer numberOfGuests;
    private String mealType;

    // rekoracje
    private String theme;

    // rozrywka
    private String performerName;
    private Integer duration;

    // ogolna cena za muzyke i dekoracje
    private BigDecimal totalPrice;
    
    // opcjonalny dodatkowy uslugodawca
    private Long vendorId;
}

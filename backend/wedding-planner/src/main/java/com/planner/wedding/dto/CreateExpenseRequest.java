package com.planner.wedding.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateExpenseRequest {
    private Long taskId;
    private BigDecimal amount;
    private String description;
    private String category;
    private LocalDateTime date;
    private String status;
}

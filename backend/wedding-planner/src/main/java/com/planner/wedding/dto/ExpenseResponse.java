package com.planner.wedding.dto;

import com.planner.wedding.entities.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponse {
    private Long id;
    private Long taskId;
    private BigDecimal amount;
    private String description;
    private String category;
    private LocalDateTime date;
    private String status;
    private Long paymentId;
    private PaymentMethod paymentMethod;
}

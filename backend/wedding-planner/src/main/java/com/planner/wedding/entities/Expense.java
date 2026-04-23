package com.planner.wedding.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "EXPENSES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;

    private BigDecimal amount;

    @Lob
    @Column
    private String description;

    private String category;

    @Column(name = "expense_date")
    private LocalDateTime date;

    private String status;

    @OneToOne(mappedBy = "expense")
    private Payment payment;
}
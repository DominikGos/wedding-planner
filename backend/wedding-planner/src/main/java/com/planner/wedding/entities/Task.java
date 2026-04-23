package com.planner.wedding.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "TASKS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @Enumerated(EnumType.STRING)
    private TaskType type;

    private String name;

    @Lob
    @Column
    private String description;

    private LocalDateTime dueDate;

    private String status;

    private Integer priority;

    // Catering

    private BigDecimal pricePerGuest;

    private Integer numberOfGuests;

    private String mealType;

    // Decoration / Entertainment

    private BigDecimal totalPrice;

    private String theme;

    private String performerName;

    private Integer duration;

    @OneToMany(mappedBy = "task")
    private List<Expense> expenses;
}
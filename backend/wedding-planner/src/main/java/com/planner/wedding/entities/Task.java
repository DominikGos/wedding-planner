package com.planner.wedding.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @JsonIgnore
    private Event event;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    @JsonIgnore
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

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

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

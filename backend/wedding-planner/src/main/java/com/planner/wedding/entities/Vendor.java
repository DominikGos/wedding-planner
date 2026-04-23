package com.planner.wedding.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "VENDORS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;

    private String serviceType;

    private String contact;

    private BigDecimal price;

    @OneToMany(mappedBy = "vendor")
    private List<Task> tasks;

    @OneToMany(mappedBy = "vendor")
    private List<Payment> payments;
}
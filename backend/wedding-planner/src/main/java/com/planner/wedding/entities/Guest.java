package com.planner.wedding.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "GUESTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    private String firstName;

    private String lastName;

    private String email;

    private String rsvpStatus;
}
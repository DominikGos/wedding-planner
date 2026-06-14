package com.planner.wedding.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @JsonIgnore
    private Event event;

    private String firstName;

    private String lastName;

    private String email;

    private String rsvpStatus;

    private String tableName;

    private String allergies;

    private String declineReason;

    @Column(unique = true)
    private String guestCode;
}

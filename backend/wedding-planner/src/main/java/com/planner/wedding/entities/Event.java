package com.planner.wedding.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "EVENTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    private String name;

    @Column(name = "event_date")
    private LocalDateTime eventDate;

    private String location;

    private String status;

    @Column(unique = true)
    private String eventCode;

    @OneToMany(mappedBy = "event")
    private List<Task> tasks;

    @OneToMany(mappedBy = "event")
    private List<Guest> guests;
}

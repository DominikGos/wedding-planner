package com.planner.wedding.dto;

import com.planner.wedding.entities.TaskType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDTO {

    private Long id;
    private Long eventId;
    private Long vendorId;
    private TaskType type;
    private String name;
    private String description;
    private LocalDateTime dueDate;
    private String status;
    private Integer priority;
}

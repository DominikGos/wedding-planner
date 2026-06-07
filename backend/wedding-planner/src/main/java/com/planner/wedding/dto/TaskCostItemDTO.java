package com.planner.wedding.dto;

import com.planner.wedding.entities.TaskType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class TaskCostItemDTO {

    private Long taskId;
    private String taskName;
    private TaskType taskType;
    private BigDecimal cost;
}
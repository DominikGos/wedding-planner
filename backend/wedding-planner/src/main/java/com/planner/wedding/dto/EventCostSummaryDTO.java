package com.planner.wedding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class EventCostSummaryDTO {

    private Long eventId;
    private List<TaskCostItemDTO> tasks;
    private BigDecimal totalCost;
}
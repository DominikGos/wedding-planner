package com.planner.wedding.controllers;

import com.planner.wedding.dto.EventCostSummaryDTO;
import com.planner.wedding.services.TaskCostService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
public class EventCostController {

    private final TaskCostService taskCostService;

    public EventCostController(TaskCostService taskCostService) {
        this.taskCostService = taskCostService;
    }

    @GetMapping("/{eventId}/cost-summary")
    public EventCostSummaryDTO getEventCostSummary(@PathVariable Long eventId) {
        return taskCostService.calculateEventCostSummary(eventId);
    }
}
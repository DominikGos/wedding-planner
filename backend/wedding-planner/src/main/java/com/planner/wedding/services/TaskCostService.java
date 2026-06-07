package com.planner.wedding.services;

import com.planner.wedding.dto.EventCostSummaryDTO;
import com.planner.wedding.dto.TaskCostItemDTO;
import com.planner.wedding.entities.Task;
import com.planner.wedding.repositories.TaskRepository;
import com.planner.wedding.services.cost.TaskCostStrategy;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class TaskCostService {

    private final TaskRepository taskRepository;
    private final Map<String, TaskCostStrategy> taskCostStrategies;

    public TaskCostService(TaskRepository taskRepository, Map<String, TaskCostStrategy> taskCostStrategies) {
        this.taskRepository = taskRepository;
        this.taskCostStrategies = taskCostStrategies;
    }

    public BigDecimal calculateTaskCost(Task task) {
        if (task.getType() == null) {
            throw new IllegalArgumentException("Task type is required to calculate cost");
        }

        TaskCostStrategy strategy = taskCostStrategies.get(task.getType().name());
        if (strategy == null) {
            throw new IllegalArgumentException("No cost strategy registered for task type: " + task.getType());
        }

        return strategy.calculate(task);
    }

    public EventCostSummaryDTO calculateEventCostSummary(Long eventId) {
        List<Task> tasks = taskRepository.findByEventId(eventId);
        List<TaskCostItemDTO> taskCosts = tasks.stream()
                .map(task -> TaskCostItemDTO.builder()
                        .taskId(task.getId())
                        .taskName(task.getName())
                        .taskType(task.getType())
                        .cost(calculateTaskCost(task))
                        .build())
                .toList();

        BigDecimal totalCost = taskCosts.stream()
                .map(TaskCostItemDTO::getCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return EventCostSummaryDTO.builder()
                .eventId(eventId)
                .tasks(taskCosts)
                .totalCost(totalCost)
                .build();
    }
}
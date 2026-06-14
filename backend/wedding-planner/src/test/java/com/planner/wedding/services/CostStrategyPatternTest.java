package com.planner.wedding.services;

import com.planner.wedding.entities.Task;
import com.planner.wedding.entities.TaskType;
import com.planner.wedding.services.cost.CateringCostStrategy;
import com.planner.wedding.services.cost.DecorationCostStrategy;
import com.planner.wedding.services.cost.EntertainmentCostStrategy;
import com.planner.wedding.services.cost.TaskCostStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CostStrategyPatternTest {

    private TaskCostService taskCostService;
    private CateringCostStrategy cateringCostStrategy;
    private DecorationCostStrategy decorationCostStrategy;
    private EntertainmentCostStrategy entertainmentCostStrategy;

    @BeforeEach
    void setUp() {
        cateringCostStrategy = new CateringCostStrategy();
        decorationCostStrategy = new DecorationCostStrategy();
        entertainmentCostStrategy = new EntertainmentCostStrategy();

        Map<String, TaskCostStrategy> strategies = new HashMap<>();
        strategies.put("CATERING", cateringCostStrategy);
        strategies.put("DECORATION", decorationCostStrategy);
        strategies.put("ENTERTAINMENT", entertainmentCostStrategy);

        // Mock eventService since it's not needed for simple strategy delegate tests
        EventService eventService = mock(EventService.class);
        taskCostService = new TaskCostService(null, strategies, eventService);
    }

    @Test
    void shouldSelectAndExecuteCateringStrategy() {
        Task task = Task.builder()
                .type(TaskType.CATERING)
                .pricePerGuest(BigDecimal.valueOf(150.00))
                .numberOfGuests(100)
                .build();

        BigDecimal cost = taskCostService.calculateTaskCost(task);
        assertEquals(BigDecimal.valueOf(15000.00), cost);
    }

    @Test
    void shouldSelectAndExecuteDecorationStrategy() {
        Task task = Task.builder()
                .type(TaskType.DECORATION)
                .totalPrice(BigDecimal.valueOf(2500.00))
                .build();

        BigDecimal cost = taskCostService.calculateTaskCost(task);
        assertEquals(BigDecimal.valueOf(2500.00), cost);
    }

    @Test
    void shouldSelectAndExecuteEntertainmentStrategy() {
        Task task = Task.builder()
                .type(TaskType.ENTERTAINMENT)
                .totalPrice(BigDecimal.valueOf(3200.00))
                .build();

        BigDecimal cost = taskCostService.calculateTaskCost(task);
        assertEquals(BigDecimal.valueOf(3200.00), cost);
    }

    @Test
    void shouldThrowExceptionWhenTaskTypeIsNull() {
        Task task = Task.builder().type(null).build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            taskCostService.calculateTaskCost(task);
        });
        assertTrue(ex.getMessage().contains("Task type is required"));
    }

    @Test
    void shouldThrowExceptionWhenStrategyNotFound() {
        // Create service with empty strategies map
        TaskCostService serviceWithoutStrategies = new TaskCostService(null, new HashMap<>(), null);
        Task task = Task.builder().type(TaskType.CATERING).build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            serviceWithoutStrategies.calculateTaskCost(task);
        });
        assertTrue(ex.getMessage().contains("No cost strategy registered"));
    }

    @Test
    void cateringStrategyShouldHandleNullValues() {
        Task nullPrices = Task.builder().type(TaskType.CATERING).pricePerGuest(null).numberOfGuests(100).build();
        Task nullGuests = Task.builder().type(TaskType.CATERING).pricePerGuest(BigDecimal.TEN).numberOfGuests(null).build();

        assertEquals(BigDecimal.ZERO, cateringCostStrategy.calculate(nullPrices));
        assertEquals(BigDecimal.ZERO, cateringCostStrategy.calculate(nullGuests));
    }

    @Test
    void decorationStrategyShouldHandleNullValues() {
        Task nullPrice = Task.builder().type(TaskType.DECORATION).totalPrice(null).build();
        assertEquals(BigDecimal.ZERO, decorationCostStrategy.calculate(nullPrice));
    }

    @Test
    void entertainmentStrategyShouldHandleNullValues() {
        Task nullPrice = Task.builder().type(TaskType.ENTERTAINMENT).totalPrice(null).build();
        assertEquals(BigDecimal.ZERO, entertainmentCostStrategy.calculate(nullPrice));
    }
}

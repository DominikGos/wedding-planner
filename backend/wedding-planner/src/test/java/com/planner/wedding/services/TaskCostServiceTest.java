package com.planner.wedding.services;

import com.planner.wedding.dto.EventCostSummaryDTO;
import com.planner.wedding.entities.Event;
import com.planner.wedding.entities.Task;
import com.planner.wedding.entities.TaskType;
import com.planner.wedding.repositories.TaskRepository;
import com.planner.wedding.services.cost.CateringCostStrategy;
import com.planner.wedding.services.cost.DecorationCostStrategy;
import com.planner.wedding.services.cost.EntertainmentCostStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskCostServiceTest {

    @Mock
    private TaskRepository taskRepository;

    private TaskCostService taskCostService;

    @BeforeEach
    void setUp() {
        taskCostService = new TaskCostService(
                taskRepository,
                Map.of(
                        "CATERING", new CateringCostStrategy(),
                        "DECORATION", new DecorationCostStrategy(),
                        "ENTERTAINMENT", new EntertainmentCostStrategy()
                )
        );
    }

    @Test
    void calculatesEventCostSummary() {
        Event event = Event.builder().id(1L).build();

        Task catering = Task.builder()
                .id(11L)
                .event(event)
                .type(TaskType.CATERING)
                .name("Catering")
                .pricePerGuest(new BigDecimal("120.00"))
                .numberOfGuests(50)
                .build();

        Task decoration = Task.builder()
                .id(12L)
                .event(event)
                .type(TaskType.DECORATION)
                .name("Decorations")
                .totalPrice(new BigDecimal("2300.00"))
                .build();

        Task entertainment = Task.builder()
                .id(13L)
                .event(event)
                .type(TaskType.ENTERTAINMENT)
                .name("DJ")
                .totalPrice(new BigDecimal("4000.00"))
                .build();

        when(taskRepository.findByEventId(1L)).thenReturn(List.of(catering, decoration, entertainment));

        EventCostSummaryDTO summary = taskCostService.calculateEventCostSummary(1L);

        assertEquals(new BigDecimal("12300.00"), summary.getTotalCost());
        assertEquals(3, summary.getTasks().size());
    }
}